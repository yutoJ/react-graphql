import gql from 'graphql-tag'

export const ME = gql`
  query me {
    user(login: "yutoj2") {
      name
      avatarUrl
    }
  }
`