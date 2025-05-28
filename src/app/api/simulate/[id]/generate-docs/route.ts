import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { generateAgentResponse } from "@/lib/gemini"

interface GenerationContext {
    startupName: string;
    description: string;
    industry: string;
    conversationHistory: Array<{
        role: string;
        content: string;
        response: string;
        timestamp: string;
        agent_name: string;
    }>;
}

async function generateDocSection(section: string, context: GenerationContext, agentRole: string) {
    const sectionPrompt = `
You are the ${agentRole.toUpperCase()} of ${context.startupName}. Generate a CONCISE perspective on:

${section}

Focus on your role-specific insights:
- CEO: Strategic vision and business impact
- CTO: Technical implementation and architecture
- Product Manager: User experience and feature roadmap
- Designer: UI/UX design approach
- Marketing: Market positioning and promotion

IMPORTANT: Your response must be a valid JSON object with EXACTLY these fields:
{
    "message": "Your role-specific insights here (2-3 focused bullet points)",
    "tone": "professional",
    "emotion": "confident"
}

REQUIREMENTS:
- Keep each bullet point under 100 characters
- Focus on your role's perspective
- Be specific and actionable
- Use clear, professional language
`;

    try {
        const response = await generateAgentResponse(agentRole, sectionPrompt, context);

        if (!response || !response.message) {
            throw new Error('Invalid response structure');
        }

        return {
            content: response.message.trim(),
            tone: response.tone || 'professional',
            emotion: response.emotion || 'confident'
        };
    } catch (error) {
        console.error('Section generation error:', error);
        return {
            content: `${agentRole.toUpperCase()} perspective unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`,
            tone: 'professional',
            emotion: 'neutral'
        };
    }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
    try {
        const simulationId = params.id;
        const accessToken = request.headers.get("Authorization")?.split("Bearer ")[1];

        if (!accessToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const supabase = createServerSupabaseClient(accessToken);

        // Get simulation details
        const { data: simulation, error: simError } = await supabase
            .from('simulations')
            .select('*')
            .eq('id', simulationId)
            .single();

        if (simError) {
            console.error("Error fetching simulation:", simError);
            return NextResponse.json({ error: "Simulation not found" }, { status: 404 });
        }

        // Get ALL conversations for this simulation
        const { data: conversations, error: convError } = await supabase
            .from('conversations')
            .select('*')
            .eq('simulation_id', simulationId)
            .order('created_at', { ascending: true });

        if (convError) {
            console.error("Error fetching conversations:", convError);
            return NextResponse.json({ error: "Failed to load conversations" }, { status: 500 });
        }

        // Context for AI generation
        const context = {
            startupName: simulation.startup_name,
            description: simulation.description,
            industry: simulation.industry,
            conversationHistory: conversations.map(conv => ({
                role: "user",
                content: conv.user_message,
                response: conv.agent_response.message,
                timestamp: conv.created_at,
                agent_name: conv.agent_name
            }))
        };

        // Define the main topics/features to document
        const topics = [
            {
                title: "# AI Monitoring System Enhancement",
                description: "Perspectives on implementing advanced AI monitoring capabilities."
            },
            {
                title: "# User Experience Improvements",
                description: "Views on enhancing the overall user experience."
            },
            {
                title: "# Performance Optimization",
                description: "Insights on system performance and optimization."
            },
            {
                title: "# Security Enhancements",
                description: "Perspectives on strengthening security measures."
            },
            {
                title: "# Integration Capabilities",
                description: "Views on expanding integration possibilities."
            }
        ];

        // Define the agents and their roles
        const agents = [
            { id: "ceo", role: "CEO", focus: "Strategic Direction" },
            { id: "cto", role: "CTO", focus: "Technical Implementation" },
            { id: "pm", role: "Product Manager", focus: "Product Development" },
            { id: "designer", role: "Designer", focus: "User Interface" },
            { id: "marketing", role: "Marketing Lead", focus: "Market Strategy" }
        ];

        // Generate documentation for each topic with all agents' perspectives
        const topicResponses = await Promise.all(
            topics.map(async (topic) => {
                const agentPerspectives = await Promise.all(
                    agents.map(async (agent) => {
                        const response = await generateDocSection(
                            `${topic.title}\n${topic.description}`,
                            context,
                            agent.id
                        );
                        return `### ${agent.role} Perspective (${agent.focus})\n${response.content}\n`;
                    })
                );

                return `${topic.title}\n${topic.description}\n\n${agentPerspectives.join('\n')}\n`;
            })
        );

        const fullDocumentation = `# ${context.startupName} - Feature Development Documentation\n
## Overview
This document outlines various perspectives from the team on key feature developments and improvements.

${topicResponses.join('\n---\n\n')}

## Summary
This collaborative document represents the combined insights of the entire team, ensuring a comprehensive approach to our development initiatives.

Generated on: ${new Date().toLocaleString()}
`;

        // Store the documentation in the database
        const { error: docError } = await supabase
            .from('documentation')
            .insert([
                {
                    simulation_id: simulationId,
                    content: fullDocumentation,
                    generated_at: new Date().toISOString(),
                    metadata: {
                        tone: "professional",
                        emotion: "confident",
                        context: {
                            startup_name: simulation.startup_name,
                            industry: simulation.industry,
                            description: simulation.description
                        }
                    }
                }
            ]);

        if (docError) {
            console.error("Error saving documentation:", docError);
            return NextResponse.json({ error: "Failed to save documentation" }, { status: 500 });
        }

        return NextResponse.json({
            documentation: fullDocumentation,
            metadata: {
                tone: "professional",
                emotion: "confident",
                generated_at: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error("Error generating documentation:", error);
        return NextResponse.json({
            error: "Failed to generate documentation",
            details: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
} 