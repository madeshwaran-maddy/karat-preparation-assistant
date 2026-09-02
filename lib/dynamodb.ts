import { 
  DynamoDBClient, 
  CreateTableCommand,
  CreateTableCommandInput,
  ScalarAttributeType,
  KeyType,
  BillingMode,
  ProjectionType
} from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-south-1",

  endpoint:
    process.env.DYNAMODB_ENDPOINT || "http://localhost:8000",

  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "local",
    secretAccessKey:
      process.env.AWS_SECRET_ACCESS_KEY || "local",
  },
});

export const dynamodb =
  DynamoDBDocumentClient.from(client);

// Table creation functions
export async function createCandidatesTable() {
  const params: CreateTableCommandInput = {
    TableName: "candidates",
    KeySchema: [{ AttributeName: "id", KeyType: "HASH" as KeyType }],
    AttributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" as ScalarAttributeType },
      { AttributeName: "email", AttributeType: "S" as ScalarAttributeType },
    ],
    BillingMode: "PAY_PER_REQUEST" as BillingMode,
    GlobalSecondaryIndexes: [
      {
        IndexName: "email-index",
        KeySchema: [{ AttributeName: "email", KeyType: "HASH" as KeyType }],
        Projection: { ProjectionType: "ALL" as ProjectionType },
      },
    ],
  };

  try {
    await client.send(new CreateTableCommand(params));
    console.log("Candidates table created successfully");
  } catch (error: any) {
    if (error.name !== "ResourceInUseException") {
      console.error("Error creating candidates table:", error);
      throw error;
    }
  }
}

export async function createAssessmentsTable() {
  const params: CreateTableCommandInput = {
    TableName: "assessments",
    KeySchema: [{ AttributeName: "id", KeyType: "HASH" as KeyType }],
    AttributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" as ScalarAttributeType },
      { AttributeName: "candidate_id", AttributeType: "S" as ScalarAttributeType },
    ],
    BillingMode: "PAY_PER_REQUEST" as BillingMode,
    GlobalSecondaryIndexes: [
      {
        IndexName: "candidate_id-index",
        KeySchema: [{ AttributeName: "candidate_id", KeyType: "HASH" as KeyType }],
        Projection: { ProjectionType: "ALL" as ProjectionType },
      },
    ],
  };

  try {
    await client.send(new CreateTableCommand(params));
    console.log("Assessments table created successfully");
  } catch (error: any) {
    if (error.name !== "ResourceInUseException") {
      console.error("Error creating assessments table:", error);
      throw error;
    }
  }
}

export async function createQuestionsTable() {
  const params: CreateTableCommandInput = {
    TableName: "questions",
    KeySchema: [{ AttributeName: "id", KeyType: "HASH" as KeyType }],
    AttributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" as ScalarAttributeType },
      { AttributeName: "assessment_id", AttributeType: "S" as ScalarAttributeType },
      { AttributeName: "candidate_id", AttributeType: "S" as ScalarAttributeType },
    ],
    BillingMode: "PAY_PER_REQUEST" as BillingMode,
    GlobalSecondaryIndexes: [
      {
        IndexName: "assessment_id-index",
        KeySchema: [{ AttributeName: "assessment_id", KeyType: "HASH" as KeyType }],
        Projection: { ProjectionType: "ALL" as ProjectionType },
      },
      {
        IndexName: "candidate_id-index",
        KeySchema: [{ AttributeName: "candidate_id", KeyType: "HASH" as KeyType }],
        Projection: { ProjectionType: "ALL" as ProjectionType },
      },
    ],
  };

  try {
    await client.send(new CreateTableCommand(params));
    console.log("Questions table created successfully");
  } catch (error: any) {
    if (error.name !== "ResourceInUseException") {
      console.error("Error creating questions table:", error);
      throw error;
    }
  }
}

export async function createEvaluationsTable() {
  const params: CreateTableCommandInput = {
    TableName: "evaluations",
    KeySchema: [{ AttributeName: "id", KeyType: "HASH" as KeyType }],
    AttributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" as ScalarAttributeType },
      { AttributeName: "assessment_id", AttributeType: "S" as ScalarAttributeType },
      { AttributeName: "candidate_id", AttributeType: "S" as ScalarAttributeType },
      { AttributeName: "question_id", AttributeType: "S" as ScalarAttributeType },
    ],
    BillingMode: "PAY_PER_REQUEST" as BillingMode,
    GlobalSecondaryIndexes: [
      {
        IndexName: "assessment_id-index",
        KeySchema: [{ AttributeName: "assessment_id", KeyType: "HASH" as KeyType }],
        Projection: { ProjectionType: "ALL" as ProjectionType },
      },
      {
        IndexName: "candidate_id-index",
        KeySchema: [{ AttributeName: "candidate_id", KeyType: "HASH" as KeyType }],
        Projection: { ProjectionType: "ALL" as ProjectionType },
      },
      {
        IndexName: "question_id-index",
        KeySchema: [{ AttributeName: "question_id", KeyType: "HASH" as KeyType }],
        Projection: { ProjectionType: "ALL" as ProjectionType },
      },
    ],
  };

  try {
    await client.send(new CreateTableCommand(params));
    console.log("Evaluations table created successfully");
  } catch (error: any) {
    if (error.name !== "ResourceInUseException") {
      console.error("Error creating evaluations table:", error);
      throw error;
    }
  }
}

export async function createLearningProgressTable() {
  const params: CreateTableCommandInput = {
    TableName: "learning_progress",
    KeySchema: [
      { AttributeName: "user_id", KeyType: "HASH" as KeyType },
      { AttributeName: "item_key", KeyType: "RANGE" as KeyType },
    ],
    AttributeDefinitions: [
      { AttributeName: "user_id", AttributeType: "S" as ScalarAttributeType },
      { AttributeName: "item_key", AttributeType: "S" as ScalarAttributeType },
    ],
    BillingMode: "PAY_PER_REQUEST" as BillingMode,
  };

  try {
    await client.send(new CreateTableCommand(params));
    console.log("Learning progress table created successfully");
  } catch (error: any) {
    if (error.name !== "ResourceInUseException") {
      console.error("Error creating learning progress table:", error);
      throw error;
    }
  }
}

// Initialize all tables
export async function initializeTables() {
  try {
    await createCandidatesTable();
    await createAssessmentsTable();
    await createQuestionsTable();
    await createEvaluationsTable();
    await createLearningProgressTable();
    console.log("All tables initialized successfully");
  } catch (error) {
    console.error("Error initializing tables:", error);
    throw error;
  }
}