/* eslint-disable react/static-property-placement */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import Container from '../../components/Container';
import { Loading, Owner, IssueList, SelectState } from './styles';

import api from '../../services/api';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    reposState: 'open',
    errorNotification: '',
    page: 1,
  };

  async componentDidMount() {
    try {
      const { reposState } = this.state;
      const page = 1;
      const [repository, issues] = await this.fetchFromApi(reposState, page);

      this.setState({
        repository: repository.data,
        issues: issues.data,
        loading: false,
      });
    } catch (error) {
      this.setState({
        errorNotification: error.message,
        loading: false,
      });
    }
  }

  fetchFromApi = async (reposState, page) => {
    // tentar try/catch dentro de _fetchFromApi_
    const { match } = this.props;

    const repoName = decodeURIComponent(match.params.repository);

    console.log('fetchFromApi', reposState);

    return Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: reposState,
          per_page: 5, // page
        },
      }),
    ]);
  };

  handleRepoStateChange = async event => {
    const { reposState } = event.target;
    const page = 1;

    this.setState({
      loading: true,
      reposState,
    });

    console.log('handleRepoStateChange reposState', this.state.reposState);
    console.log('handleRepoStateChange value', reposState);

    const [repository, issues] = await this.fetchFromApi(reposState, page);

    console.log('handleRepoStateChange after fetchFromApi', reposState);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  };

  render() {
    const {
      loading,
      repository,
      issues,
      reposState,
      errorNotification,
    } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    if (errorNotification) {
      return <Container> {errorNotification} </Container>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name} </h1>
          <p> {repository.description} </p>
        </Owner>

        <IssueList>
          <p id="repo-state">
            Estado das issues:
            <SelectState
              onChange={this.handleRepoStateChange}
              defaultValue={reposState}
            >
              {['all', 'open', 'closed'].map(repoStateOption => (
                <option key={repoStateOption} value={repoStateOption}>
                  {repoStateOption}
                </option>
              ))}
            </SelectState>
          </p>

          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}> {issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}> {label.name} </span>
                  ))}
                </strong>
                <p> {issue.user.login} </p>
              </div>
            </li>
          ))}
        </IssueList>
      </Container>
    );
  }
}
