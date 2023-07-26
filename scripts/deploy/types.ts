export type WorkflowEnvironment = 'production' | 'dev';
export type WorkflowType = 'onboarding' | 'filefeed' | 'embedded' | 'dynamic';

export type WorkflowEnv = {
  [key in WorkflowEnvironment]: {
    [key in WorkflowType]: {
      apiKey: string;
      environmentId: string;
    };
  };
};
