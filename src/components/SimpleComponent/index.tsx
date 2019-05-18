import React from 'react';
import styled from 'styled-components';

interface Props {
  title: string;
}

const Title = styled.div`
  background: #353644;
  color: #1edc8c;
  font-weight: bold;
  font-size: 24px;
  padding: 25px;
`;

export const SimpleComponent = (props: Props) => {
  const { title } = props;
  return <Title>{title}</Title>;
};
