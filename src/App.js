import React, { Component } from 'react'
import client from './client'
import { ApolloProvider } from 'react-apollo'
import { Query } from 'react-apollo'
import { ME, SEARCH_REPOSITORIES } from './graphql'

const PER_PAGE = 10
const VARIABLES = {
  first: PER_PAGE,
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

  goNext(search) {
    this.setState({
      first: PER_PAGE,
      after: search.pageInfo.endCursor,
      last: null,
      before: null
    })
  }

  goPrevious(search) {
    this.setState({
      first: null,
      after: null,
      last: PER_PAGE,
      before: search.pageInfo.startCursor
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
                            <a href={node.url} target="_blank" rel="noopener noreferrer">{node.name}</a>
                          </li>
                        )
                      })
                    }
                  </ul>
                  {
                    data.search.pageInfo.hasPreviousPage === true ?
                      <button
                        onClick={this.goPrevious.bind(this, data.search)}
                      >
                        Previous
                      </button>
                      :
                      null
                    
                  }
                  {
                    data.search.pageInfo.hasNextPage === true ?
                      <button
                        onClick={this.goNext.bind(this, data.search)}
                      >
                        Next
                      </button>
                      :
                      null
                    
                  }
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
