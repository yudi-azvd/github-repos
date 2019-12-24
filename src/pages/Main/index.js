import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';

import api from '../../services/api';

import Container from '../../components/Container';
import ErrorNotification from '../../components/ErrorNotification';
import { Form, SubmitButton, List } from './styles';

export default class Main extends Component {
  state = {
    newRepo: '',
    repositories: [],
    loading: false,
    errorNotification: '',
  };

  componentDidMount() {
    const repositories = JSON.parse(localStorage.getItem('repositories'));

    if (repositories) {
      this.setState({ repositories });
    }
  }

  componentDidUpdate(_, prevState) {
    const { repositories } = this.state;

    if (prevState.repositories !== repositories) {
      localStorage.setItem('repositories', JSON.stringify(repositories));
    }
  }

  /**
   * Métodos devem ser arrow functions para _this_
   * se referenciar o objeto adequado
   */
  handleInputChange = event => {
    this.setState({ newRepo: event.target.value });
  };

  handleSubmit = async event => {
    try {
      event.preventDefault();
      this.setState({ loading: true });

      const { newRepo, repositories } = this.state;

      const duplicateRepo = repositories.filter(repo => repo.name === newRepo);

      if (duplicateRepo.length) {
        throw new Error('Repositório duplicado');
      }

      const response = await api.get(`/repos/${newRepo}`);
      const data = {
        name: response.data.full_name,
      };

      this.setState({
        repositories: [...repositories, data],
        newRepo: '',
        loading: false,
        errorNotification: '',
      });
    } catch (error) {
      this.setState({
        errorNotification: error.message,
        loading: false,
      });
    }
  };

  render() {
    const { newRepo, loading, repositories, errorNotification } = this.state;

    return (
      <Container>
        <h1>
          <FaGithubAlt />
          Repositórios
        </h1>

        <Form
          onSubmit={this.handleSubmit}
          errorNotification={errorNotification}
        >
          <input
            type="text"
            placeholder="Novo repositório"
            value={newRepo}
            onChange={this.handleInputChange}
          />

          <SubmitButton loading={loading ? 1 : 0}>
            {loading ? (
              <FaSpinner color="#fff" size={14} />
            ) : (
              <FaPlus color="#fff" size={14} />
            )}
          </SubmitButton>
        </Form>

        <ErrorNotification> {errorNotification} </ErrorNotification>

        <List>
          {repositories.map(repository => (
            <li key={repository.name}>
              <span>{repository.name} </span>
              <Link to={`/repository/${encodeURIComponent(repository.name)}`}>
                Detalhes
              </Link>
            </li>
          ))}
        </List>
      </Container>
    );
  }
}
