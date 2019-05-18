import React from 'react';
import { render } from 'react-testing-library';
import { SimpleComponent } from '.';

test('it works', () => {
  const { container } = render(<SimpleComponent title={'My title'} />);
  expect(container.firstChild).toMatchSnapshot();
})