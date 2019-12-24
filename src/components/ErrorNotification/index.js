import styled from 'styled-components';

const ErrorNotification = styled.small`
  position: absolute; /** pra não ocupar espaço (fora do fluxo do documento)
    e empurrar a lista mais pra baixo */
  margin-top: 5px;
  font-size: 12px;
  color: #f00;
`;

export default ErrorNotification;
