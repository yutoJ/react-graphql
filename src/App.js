import React, { Component } from 'react'
import client from './client'
import { ApolloProvider } from 'react-apollo'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'

const ME = gql`
  query me {
    user(login: "yutoj2") {
      name
      avatarUrl
    }
  }
`

class App extends Component {
  render() {
    return (
      <ApolloProvider client={client}>
        <Query query={ME}>
          { 
            ({ loading, error, data }) => {
              if (loading) return 'Loading...'
              if (error) return `Error! ${error.message}`

              return <div>{data.user.name}</div>
            }
          }
        </Query>
      </ApolloProvider>
    )
  }
}

export default App
