import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { GoogleGenerativeAI } from "@google/generative-ai"

if (!process.env.GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY environment variable")
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(request: Request) {
    try {
        const accessToken = request.headers.get("Authorization")?.split("Bearer ")[1]
        if (!accessToken) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const supabase = createServerSupabaseClient(accessToken)
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = await request.json()
        const { agent: agentName, question, contextId } = body

        // Get simulation context
        const { data: simulation, error: simulationError } = await supabase
            .from("simulations")
            .select("*")
            .eq("id", contextId)
            .single()

        if (simulationError || !simulation) {
            return new NextResponse("Simulation not found", { status: 404 })
        }

        // Check if user owns this simulation
        if (simulation.user_id !== user.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        // Get agent's previous output and other agents' outputs for context
        const { data: agentOutputs } = await supabase
            .from("agent_outputs")
            .select("agent_name, output")
            .eq("simulation_id", contextId)

        const currentAgentOutput = agentOutputs?.find((o) => o.agent_name === agentName)?.output || ""
        const otherAgentsOutput = agentOutputs
            ?.filter((o) => o.agent_name !== agentName)
            .reduce((acc: Record<string, string>, curr) => {
                acc[curr.agent_name] = curr.output
                return acc
            }, {})

        // Generate response using Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-pro" })

        const prompt = `You are the ${agentName.toUpperCase()} of ${simulation.startup_name}, a startup in the ${simulation.industry
            } industry.

Your previous analysis was:
${currentAgentOutput}

Other team members have provided these insights:
${Object.entries(otherAgentsOutput || {})
                .map(([agent, output]) => `${agent.toUpperCase()}: ${output}`)
                .join("\n")}

Question from the team: ${question}

Provide a detailed answer based on your role and expertise, taking into account the previous context and team insights.
Format your response in a clear, structured way using markdown.`

        const result = await model.generateContent(prompt)
        const response = result.response
        const answer = response.text()

        // Save the interaction
        const { error: chatError } = await supabase.from("chat_interactions").insert([
            {
                simulation_id: contextId,
                agent_name: agentName,
                question,
                answer,
            },
        ])

        if (chatError) {
            console.error("Error saving chat interaction:", chatError)
        }

        return NextResponse.json({ answer, agent: agentName })
    } catch (error) {
        console.error("Error in ask agent:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
} 