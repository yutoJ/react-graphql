import React, { Component } from 'react'
import client from './client'
import { ApolloProvider } from 'react-apollo'
import { Query } from 'react-apollo'
import { ME, SEARCH_REPOSITORIES } from './graphql'

const VARIABLES = {
  first: 10,
  after: null,
  last: null,
  before: null,
  query: "swiftui"
}

class App extends Component {
  constructor(props) {
    super(props)
    this.state = VARIABLES
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(event) {
    this.setState({
      ...VARIABLES,
      query: event.target.value
    })
  }

  render() {
    const { query, first, last, before, after } = this.state
    return (
      <ApolloProvider client={client}>
        <form>
          <input value={query} onChange={this.handleChange} />
        </form>
        <Query query={ME}>
          { 
            ({ loading, error, data }) => {
              if (loading) return 'Loading...'
              if (error) return `Error! ${error.message}`

              return (
                <React.Fragment>
                  <h2>{data.user.name}</h2>
                </React.Fragment>
              )
            }
          }
        </Query>
        <Query
          query={SEARCH_REPOSITORIES}
          variables={{ query, first, last, before, after }}
        >
          { 
            ({ loading, error, data }) => {
              if (loading) return 'Loading...'
              if (error) return `Error! ${error.message}`
              console.log({data})
              return (
                <React.Fragment>
                  <ul>
                    {
                      data.search.edges.map(edge => {
                        const node = edge.node

                        return (
                          <li key={node.id}>
                            <a href={node.url} target="_blank">{node.name}</a>
                          </li>
                        )
                      })
                    }
                  </ul>
                </React.Fragment>
              )
            }
          }
        </Query>
      </ApolloProvider>
    )
  }
}

export default App
