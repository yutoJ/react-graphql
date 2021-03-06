import React, { Component } from 'react'
import client from './client'
import { ApolloProvider, Mutation, Query } from 'react-apollo'
import { ME, SEARCH_REPOSITORIES, ADD_STAR, REMOVE_STAR } from './graphql'
import { List, Typography, Input, Layout, Menu, Breadcrumb, Spin, Button, Icon } from 'antd';
import './App.css';

const Search = Input.Search;
const { Header, Footer, Content } = Layout;

const { Title } = Typography;

const StarButton = props => {
  const { node, query, first, last, before, after } = props
  const totalCount = node.stargazers.totalCount
  const viewerHasStarred = node.viewerHasStarred
  const StartStatus = ({addOrRemoveStar}) => {
    return (
      <Button onClick={
        () => {
          addOrRemoveStar({
            variables: { input: { starrableId: node.id }},
            // update only cache
            update: (store, {data: { addStar, removeStar }}) => {
              const { starrable } = addStar || removeStar
              const data = store.readQuery({
                query: SEARCH_REPOSITORIES,
                variables: { query, first, last, after, before }
              })
              const edges = data.search.edges
              const newEdges = edges.map(edge => {
                if (edge.node.id === node.id) {
                  const totalCount = edge.node.stargazers.totalCount
                  const diff = starrable.viewerHasStarred ? 1 : -1
                  const newTotalCount = totalCount + diff
                  edge.node.stargazers.totalCount = newTotalCount
                }
                return edge
              })
              data.search.edges = newEdges
              store.writeQuery({ query: SEARCH_REPOSITORIES, data})
            }
          })
        }
      }>
      <Icon type="star" style={{ color: 'yellow' }} theme="filled"/>
        {totalCount} | {viewerHasStarred? 'starred' : '-'}
      </Button>
    )
  }
  return (
    // NOTE Fetch data ver
    // <Mutation 
    //   mutation={viewerHasStarred ? REMOVE_STAR : ADD_STAR}
    //   refetchQueries={ mutationResult => {
    //     console.log({mutationResult})
    //     return [
    //       {
    //         query: SEARCH_REPOSITORIES,
    //         variables: { query, first, last, before, after }
    //       }
    //     ]
    //   }}
    // >
    // {
    //   addOrRemoveStar => <StartStatus addOrRemoveStar={addOrRemoveStar} />
    // }
    // </Mutation>
    // Rewrite cache ver
    <Mutation 
      mutation={viewerHasStarred ? REMOVE_STAR : ADD_STAR}
    >
    {
      addOrRemoveStar => <StartStatus addOrRemoveStar={addOrRemoveStar} />
    }
    </Mutation>
  )
}

const PER_PAGE = 10
const VARIABLES = {
  first: PER_PAGE,
  after: null,
  last: null,
  before: null,
  query: "nuxt-media"
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

  search(value) {
    this.setState({
      ...VARIABLES,
      query: value
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
        <div className="App">
        <Layout className="layout">
          <Header>
            <div className="logo" />
            <Menu
              theme="dark"
              mode="horizontal"
              defaultSelectedKeys={['2']}
              style={{ lineHeight: '64px' }}
            >
              <Menu.Item key="1">Home</Menu.Item>
              <Menu.Item key="2">Search</Menu.Item>
            </Menu>
          </Header>
          <Content style={{ padding: '0 50px' }}>
            <Breadcrumb style={{ margin: '16px 0' }}>
              <Breadcrumb.Item>Home</Breadcrumb.Item>
              <Breadcrumb.Item>Search</Breadcrumb.Item>
            </Breadcrumb>
            <Query query={ME}>
              { 
                ({ loading, error, data }) => {
                  if (loading) return <Spin size="large" />
                  if (error) return `Error! ${error.message}`

                  return (
                    <React.Fragment>
                      <Title>{data.user.name}</Title>
                    </React.Fragment>
                  )
                }
              }
            </Query>
            <form>
              {/* <Input value={query} onChange={this.handleChange} style={{ width: '50%' }}/> */}
              <Search
                placeholder="input search text"
                enterButton="Search"
                size="large"
                style={{ width: '50%' }}
                onSearch={value => this.search(value)}
              />
            </form>
            <Query
              query={SEARCH_REPOSITORIES}
              variables={{ query, first, last, before, after }}
            >
              { 
                ({ loading, error, data }) => {
                  if (loading) return <Spin size="large" />
                  if (error) return `Error! ${error.message}`
                  console.log({data})
                  return (
                    <React.Fragment>
                      <List>
                        {
                          data.search.edges.map(edge => {
                            const node = edge.node

                            return (
                              <List.Item key={node.id} style={{ width: '50%' }}>
                                <List.Item.Meta
                                  title={<a href={node.url} target="_blank" rel="noopener noreferrer">{node.name}</a>}
                                />
                                <StarButton node={node} {...{query, first, last, after, before}}/>
                              </List.Item>
                            )
                          })
                        }
                      </List>
                      {
                        data.search.pageInfo.hasPreviousPage === true ?
                          <Button
                            onClick={this.goPrevious.bind(this, data.search)}
                            type="dashed"
                          >
                            <Icon type="left" />
                            Previous
                          </Button>
                          :
                          null
                        
                      }
                      {
                        data.search.pageInfo.hasNextPage === true ?
                          <Button
                            onClick={this.goNext.bind(this, data.search)}
                            type="dashed"
                          >
                            Next
                            <Icon type="right" />
                          </Button>
                          :
                          null
                        
                      }
                    </React.Fragment>
                  )
                }
              }
            </Query>
          </Content>
          <Footer style={{ textAlign: 'center' }}>Git repo search ©2019 Created by yutoj</Footer>
        </Layout>
        </div>
      </ApolloProvider>
    )
  }
}

export default App
