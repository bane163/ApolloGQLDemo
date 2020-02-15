const { ApolloServer, gql } = require('apollo-server');
const fs = require('fs');

const typeDefs = gql`
 type Query {
        getStudios: [Studio]
        getUsers: [User]
    }

    type Mutation {
        createUser(input: UserInput): User
    }

    type Studio {
        id: ID
        name: String
        region: String
        department: String
        users: [User]
    }

    type User {
        id: ID
        name: String
        title: String
        studio: Studio
    }

    input UserInput {
        name: String
        title: String
        studio: StudioInput
    }

    input StudioInput {
        name: String
        region: String
        department: String
        users: [UserInput]
    }
`;

getFromFile = (fileName) => {
    let rawData = fs.readFileSync(fileName);
    let parsedData = JSON.parse(rawData);
    return parsedData;
}

const resolvers = {
    Mutation: {
        createUser: ({ input }) => {
            let existingUsers = getFromFile('user.json');
            let count = existingUsers.length + 1;
            let newUser = new User(count, input);
            existingUsers.push(newUser);
            fs.writeFileSync('user.json', JSON.stringify(existingUsers, null, 2));
            return newUser;
        }
    },
    Query: {
        getStudios: () => {
            return getFromFile('studio.json');
        },
        getUsers: () => {
            return getFromFile('user.json');
        },
    },
    User: {
        studio(parent) {
            console.log('User Parent:' + JSON.stringify(parent));
            const studio = getFromFile('studio.json').find(
                (studio) => studio.users.includes(parent.studio)  
            );
            return studio;
        }
    },
    Studio: {
        users(parent) {
            console.log('Studio Parent:' + JSON.stringify(parent));
            const users = getFromFile('user.json').filter(({ id }) =>
                parent.users.includes(id)
            );
            return users;
        }
    }
}

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
    console.log(` Server ready at ${url}`);
});