import express from "express";
import { ApolloServer, gql } from "apollo-server-express";
import type { Server } from "http";
import { ApolloServerPluginLandingPageLocalDefault } from "apollo-server-core";

// This is a (sample) collection of books we'll be able to query
// the GraphQL server for.  A more complete example might fetch
// from an existing data source like a REST API or database.
const books = [
  {
    title: "Parable of the Sower",
    author: "Octavia E. Butler",
  },
  {
    title: "Jurassic Park",
    author: "Michael Crichton",
  },
];

// Type definitions define the "shape" of your data and specify
// which ways the data can be fetched from the GraphQL server.
const typeDefs = gql`
  # Comments in GraphQL are defined with the hash (#) symbol.

  # This "Book" type can be used in other type declarations.
  type Book {
    title: String
    author: String
  }

  # The "Query" type is the root of all GraphQL queries.
  # (A "Mutation" type will be covered later on.)
  type Query {
    books: [Book]
  }
`;

// Resolvers define the technique for fetching the types in the
// schema.  We'll retrieve books from the "books" array above.
const resolvers = {
  Query: {
    books: () => books,
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  csrfPrevention: false,
  plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })]
});

const app = express();

async function startApolloServer() {
  await server.start();

  server.applyMiddleware({
    app,
    path: "/",
  });

  let httpServer: Server;
  await new Promise<void>(
    (resolve) => (httpServer = app.listen(0, "127.0.0.1", () => resolve()))
  );
  return { server, app, httpServer };
}

startApolloServer()
  .then(({ httpServer }) => {
    const address = httpServer.address();
    const serverUrl =
      process.env.SANDBOX_URL ??
      (typeof address === "string"
        ? address
        : `http://${address.address}:${address.port}`);
    console.log(`🚀 Server ready at ${serverUrl}`);
  })
  .catch((err) => {
    console.error("An error occurred during `startApolloServer`:");
    console.error(err);
    process.exit(1);
  });
