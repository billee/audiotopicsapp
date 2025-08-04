import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import BackgroundImage from '../BackgroundImage';

// Mock FastImage
jest.mock('react-native-fast-image', () => {
  const React = require('react');
  const { View } = require('react-native');
  
  const MockFastImage = React.forwardRef((props: any, ref: any) => {
    React.useEffect(() => {
      // Simulate successful image load
      setTimeout(() => {
        if (props.onLoad) {
          props.onLoad();
        }
      }, 100);
    }, [props.onLoad]);

    return <View testID="mock-fast-image" {...props} />;
  });

  MockFastImage.resizeMode = {
    cover: 'cover',
    contain: 'contain',
    stretch: 'stretch',
    center: 'center',
  };

  MockFastImage.priority = {
    low: 'low',
    normal: 'normal',
    high: 'high',
  };

  MockFastImage.cacheControl = {
    immutable: 'immutable',
    web: 'web',
    cacheOnly: 'cacheOnly',
  };

  MockFastImage.preload = jest.fn(() => Promise.resolve());

  return MockFastImage;
});

// Mock LinearGradient
jest.mock('react-native-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  
  return (props: any) => <View testID="mock-linear-gradient" {...props} />;
});

describe('BackgroundImage', () => {
  const defaultProps = {
    source: 'https://example.com/image.jpg',
    children: <Text>Test Content</Text>,
  };

  it('renders correctly with default props', () => {
    const { getByTestId, getByText } = render(
      <BackgroundImage {...defaultProps} />
    );

    expect(getByTestId('background-image')).toBeTruthy();
    expect(getByText('Test Content')).toBeTruthy();
  });

  it('renders with custom testID', () => {
    const { getByTestId } = render(
      <BackgroundImage {...defaultProps} testID="custom-background" />
    );

    expect(getByTestId('custom-background')).toBeTruthy();
  });

  it('renders overlay when overlay prop is true', () => {
    const { getByTestId } = render(
      <BackgroundImage {...defaultProps} overlay={true} />
    );

    expect(getByTestId('mock-linear-gradient')).toBeTruthy();
  });

  it('does not render overlay when overlay prop is false', () => {
    const { queryByTestId } = render(
      <BackgroundImage {...defaultProps} overlay={false} />
    );

    expect(queryByTestId('mock-linear-gradient')).toBeFalsy();
  });

  it('handles string source correctly', () => {
    const { getByTestId } = render(
      <BackgroundImage source="https://example.com/image.jpg">
        <Text>Content</Text>
      </BackgroundImage>
    );

    expect(getByTestId('mock-fast-image')).toBeTruthy();
  });

  it('handles object source correctly', () => {
    const { getByTestId } = render(
      <BackgroundImage source={{ uri: 'https://example.com/image.jpg' }}>
        <Text>Content</Text>
      </BackgroundImage>
    );

    expect(getByTestId('mock-fast-image')).toBeTruthy();
  });

  it('calls onLoad callback when image loads', async () => {
    const onLoadMock = jest.fn();
    
    render(
      <BackgroundImage {...defaultProps} onLoad={onLoadMock} />
    );

    await waitFor(() => {
      expect(onLoadMock).toHaveBeenCalled();
    });
  });

  it('shows loading state when showLoadingState is true', () => {
    const { getByTestId } = render(
      <BackgroundImage {...defaultProps} showLoadingState={true} />
    );

    // Initially should show loading
    expect(getByTestId('background-image-loading')).toBeTruthy();
  });

  it('applies custom styles correctly', () => {
    const customStyle = { backgroundColor: 'red' };
    const { getByTestId } = render(
      <BackgroundImage {...defaultProps} style={customStyle} />
    );

    const container = getByTestId('background-image');
    expect(container.props.style).toContainEqual(customStyle);
  });
});