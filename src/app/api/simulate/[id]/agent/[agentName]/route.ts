import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"

export async function PUT(
    request: Request,
    { params }: { params: { id: string; agentName: string } }
) {
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

        const simulationId = params.id
        const agentName = params.agentName
        const body = await request.json()
        const { field, value } = body

        // Get simulation details
        const { data: simulation, error: simulationError } = await supabase
            .from("simulations")
            .select("*")
            .eq("id", simulationId)
            .single()

        if (simulationError || !simulation) {
            return new NextResponse("Simulation not found", { status: 404 })
        }

        // Check if user owns this simulation
        if (simulation.user_id !== user.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        // Get current agent output
        const { data: currentOutput } = await supabase
            .from("agent_outputs")
            .select("output")
            .eq("simulation_id", simulationId)
            .eq("agent_name", agentName)
            .single()

        // Update agent output
        const { error: updateError } = await supabase.from("agent_outputs").upsert(
            [
                {
                    simulation_id: simulationId,
                    agent_name: agentName,
                    output: value,
                    context: JSON.stringify({
                        field,
                        manual_update: true,
                    }),
                },
            ],
            {
                onConflict: "simulation_id,agent_name",
            }
        )

        if (updateError) {
            console.error("Error updating agent output:", updateError)
            return new NextResponse("Error updating agent output", { status: 500 })
        }

        // Log the change
        await supabase.from("change_logs").insert([
            {
                simulation_id: simulationId,
                agent_name: agentName,
                field,
                old_value: currentOutput?.output || "",
                new_value: value,
                modified_by: user.id,
                type: "manual",
            },
        ])

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error in update agent:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
} 