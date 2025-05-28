export interface SimulationInput {
    startupName: string;
    description: string;
    industry: string;
    userId?: string;
}

export interface AgentOutput {
    id: string;
    simulation_id: string;
    agent_name: string; // Use agent_name to match API
    output: string;
    context: string;
    last_updated: string;
  }
export interface Simulation {
    id: string;
    userId: string;
    startupName: string;
    description: string;
    industry: string;
    version: number;
    createdAt: Date;
    updatedAt: Date;
    agents?: AgentOutput[];
}

export interface ChatInteraction {
    id: string;
    simulationId: string;
    agentName: string;
    question: string;
    answer: string;
    createdAt: Date;
}

export interface ChangeLog {
    id: string;
    simulationId: string;
    agentName: string;
    field: string;
    oldValue: string;
    newValue: string;
    modifiedBy: string;
    modifiedAt: Date;
    type: 'manual' | 'regenerated' | 'applied_from_chat';
} 