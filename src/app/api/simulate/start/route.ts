import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"

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
        const { startupName, description, industry } = body

        // Validate required fields
        if (!startupName || !description || !industry) {
            return new NextResponse(
                JSON.stringify({ message: "Missing required fields" }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            )
        }

        // Create simulation record
        const { data: simulation, error: simulationError } = await supabase
            .from("simulations")
            .insert([
                {
                    user_id: user.id,
                    startup_name: startupName,
                    description,
                    industry
                },
            ])
            .select()
            .single()

        if (simulationError) {
            console.error("Error creating simulation:", simulationError)
            return new NextResponse(
                JSON.stringify({ message: "Error creating simulation", error: simulationError }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            )
        }

        return NextResponse.json({
            simulationId: simulation.id,
            message: "Simulation created successfully"
        })
    } catch (error) {
        console.error("Error in simulation start:", error)
        return new NextResponse(
            JSON.stringify({ message: "Internal Server Error", error: String(error) }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
    }
} 