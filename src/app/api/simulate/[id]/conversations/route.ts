import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { generateAgentResponse } from "@/lib/gemini"

interface Conversation {
    role: "user";
    content: string;
    response: string;
    timestamp: string;
    agent_name: string;  // Adding agent_name to track who said what
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const { searchParams } = new URL(request.url)
        const agentName = searchParams.get('agent')
        const simulationId = params.id

        if (!agentName) {
            return NextResponse.json({ error: "Agent name is required" }, { status: 400 })
        }

        const accessToken = request.headers.get("Authorization")?.split("Bearer ")[1]
        if (!accessToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const supabase = createServerSupabaseClient(accessToken)

        // First get the simulation details for context
        const { data: simulation, error: simError } = await supabase
            .from('simulations')
            .select('*')
            .eq('id', simulationId)
            .single()

        if (simError) {
            console.error("Error fetching simulation:", simError)
            return NextResponse.json({ error: "Simulation not found" }, { status: 404 })
        }

        // Get all conversations for this agent in this simulation
        const { data: conversations, error: convError } = await supabase
            .from('conversations')
            .select('*')
            .eq('simulation_id', simulationId)
            .eq('agent_name', agentName)
            .order('created_at', { ascending: true })

        if (convError) {
            console.error("Error fetching conversations:", convError)
            return NextResponse.json({ error: "Failed to load conversations" }, { status: 500 })
        }

        return NextResponse.json({ conversations, simulation })
    } catch (error) {
        console.error("Error in GET conversations:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
    try {
        const simulationId = params.id;
        const { message, agentName } = await request.json();

        if (!message || !agentName) {
            return NextResponse.json({ error: "Message and agent name are required" }, { status: 400 });
        }

        const accessToken = request.headers.get("Authorization")?.split("Bearer ")[1];
        if (!accessToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify Gemini API key is configured
        if (!process.env.GEMINI_API_KEY) {
            console.error("CRITICAL ERROR: GEMINI_API_KEY is not configured");
            return NextResponse.json({
                error: "Server configuration error: AI service not configured",
                details: "Missing GEMINI_API_KEY environment variable"
            }, { status: 500 });
        }

        const supabase = createServerSupabaseClient(accessToken);

        // Get simulation context
        const { data: simulation, error: simError } = await supabase
            .from('simulations')
            .select('*')
            .eq('id', simulationId)
            .single();

        if (simError) {
            console.error("Error fetching simulation:", simError);
            return NextResponse.json({
                error: "Simulation not found",
                details: simError.message
            }, { status: 404 });
        }

        // Get ALL recent conversations for this simulation
        const { data: allConversations, error: convError } = await supabase
            .from('conversations')
            .select('agent_name, user_message, agent_response, created_at')
            .eq('simulation_id', simulationId)
            .order('created_at', { ascending: true })  // Changed to ascending to maintain chronological order
            .limit(15);

        if (convError) {
            console.error("Error fetching conversations:", convError);
            return NextResponse.json({
                error: "Failed to load conversation history",
                details: convError.message
            }, { status: 500 });
        }

        // Create a unified conversation history
        const conversationHistory: Conversation[] = allConversations?.map(conv => ({
            role: "user",
            content: conv.user_message,
            response: conv.agent_response.message,
            timestamp: conv.created_at,
            agent_name: conv.agent_name
        })) || [];

        try {
            // Generate agent response with full conversation context
            const response = await generateAgentResponse(
                agentName,
                message,
                {
                    startupName: simulation.startup_name,
                    description: simulation.description,
                    industry: simulation.industry,
                    conversationHistory: conversationHistory
                }
            );

            // Save the conversation
            const { error: saveError } = await supabase
                .from('conversations')
                .insert([
                    {
                        simulation_id: simulationId,
                        agent_name: agentName,
                        user_message: message,
                        agent_response: response
                    }
                ]);

            if (saveError) {
                console.error("Error saving conversation:", saveError);
                return NextResponse.json({
                    error: "Failed to save conversation",
                    details: saveError.message
                }, { status: 500 });
            }

            return NextResponse.json({ response });

        } catch (aiError: Error | unknown) {
            console.error("AI Generation Error:", aiError);
            return NextResponse.json({
                error: "Failed to generate AI response",
                details: aiError instanceof Error ? aiError.message : "Unknown AI generation error"
            }, { status: 500 });
        }

    } catch (error: Error | unknown) {
        console.error("Error in POST conversation:", error);
        return NextResponse.json({
            error: "Internal server error",
            details: error instanceof Error ? error.message : "Unknown error occurred"
        }, { status: 500 });
    }
} 