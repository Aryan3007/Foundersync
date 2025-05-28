import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"

interface DocumentationResponse {
    id: string;
    content: string;
    metadata: {
        tone: string;
        emotion: string;
        generated_at: string;
    };
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const simulationId = params.id;
        const accessToken = request.headers.get("Authorization")?.split("Bearer ")[1];

        if (!accessToken) {
            console.error("No access token provided");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const supabase = createServerSupabaseClient(accessToken);

        // Log the query parameters
        console.log("Fetching documents for simulation:", simulationId);

        // Get all documentation for this simulation
        const { data: documents, error } = await supabase
            .from('documentation')
            .select(`
                id,
                content,
                metadata,
                generated_at,
                simulation_id
            `)
            .eq('simulation_id', simulationId)
            .order('generated_at', { ascending: false });

        // Log the query results
        console.log("Query result:", { documents: !!documents, error: error || 'none' });

        if (error) {
            console.error("Database error:", error);
            return NextResponse.json({
                error: "Failed to fetch documentation",
                details: error.message
            }, { status: 500 });
        }

        if (!documents) {
            console.log("No documents found for simulation:", simulationId);
            return NextResponse.json({ documents: [] });
        }

        // Map database fields to match frontend expected structure
        const mappedDocuments: DocumentationResponse[] = documents.map(doc => ({
            id: doc.id,
            content: doc.content || '',
            metadata: {
                tone: doc.metadata?.tone || 'professional',
                emotion: doc.metadata?.emotion || 'neutral',
                generated_at: doc.generated_at
            }
        }));

        console.log(`Successfully mapped ${mappedDocuments.length} documents`);
        return NextResponse.json({ documents: mappedDocuments });

    } catch (error) {
        console.error("Unexpected error in GET /docs:", error);
        return NextResponse.json({
            error: "Failed to fetch documentation",
            details: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined
        }, { status: 500 });
    }
} 