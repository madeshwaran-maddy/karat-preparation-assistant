/*import { NextResponse } from "next/server";]
['ghsaqw]
import {
  CreateTableCommand,
} from "@aws-sdk/client-dynamodb";

import { dynamodb } from "../../../../lib/dynamodb";


export async function GET() {
  try {
    const command = new CreateTableCommand({
      TableName: "candidates",

      KeySchema: [
        {
          AttributeName: "id",
          KeyType: "HASH",
        },
      ],

      AttributeDefinitions: [
        {
          AttributeName: "id",
          AttributeType: "S",
        },
        {
          AttributeName: "email",
          AttributeType: "S",
        },
      ],

      GlobalSecondaryIndexes: [
        {
          IndexName: "email-index",
          KeySchema: [
            {
              AttributeName: "email",
              KeyType: "HASH",
            },
          ],
          Projection: {
            ProjectionType: "ALL",
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
          },
        },
      ],

      BillingMode: "PROVISIONED",
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
    });

    await dynamodb.send(command);

    return NextResponse.json({
      message: "Table created successfully",
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to create table",
      },
      { status: 500 }
    );
  }
}

import { initializeTables } from '../../../../lib/dynamodb';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await initializeTables();
    return NextResponse.json({ message: "Tables initialized successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create table" }, { status: 500 });
  }
}
  */
