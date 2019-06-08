import React, { Component } from 'react'
import client from './client'
import { ApolloProvider } from 'react-apollo'
import { Query } from 'react-apollo'
import { ME, SEARCH_REPOSITORIES } from './graphql'
import { List, Typography, Input, Layout, Menu, Breadcrumb, Spin, Button, Icon } from 'antd';
import './App.css';

const { Header, Footer, Content } = Layout;

const { Title } = Typography;

const StarButton = props => {
  const node = props.node
  const totalCount = node.stargazers.totalCount
  const viewerHasStarred = node.viewerHasStarred
  return (
    <Button>
      <Icon type="star" style={{ color: 'yellow' }} theme="filled"/>
      {totalCount} | {viewerHasStarred? 'starred' : '-'}
    </Button>
  )
}

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
              <Input value={query} onChange={this.handleChange} style={{ width: '30%' }}/>
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
                              <List.Item key={node.id}>
                                <a href={node.url} target="_blank" rel="noopener noreferrer">{node.name}</a>
                                &nbsp;
                                <StarButton node={node}/>
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
          <Footer style={{ textAlign: 'center' }}>Ant Design ©2018 Created by Ant UED</Footer>
        </Layout>
        </div>
      </ApolloProvider>
    )
  }
}

export default App
