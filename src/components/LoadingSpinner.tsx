import React from "react";
import styled, { keyframes } from "styled-components";

interface LoadingSpinnerProps {
  size?: number;
  thickness?: number;
  speed?: number;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 40,
  thickness = 4,
  speed = 0.75,
}) => {
  return <Spinner size={size} thickness={thickness} speed={speed} />;
};

const spin = keyframes`
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
`;

const Spinner = styled.div<LoadingSpinnerProps>`
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  border: ${(props) => props.thickness}px solid rgba(0, 0, 0, 0.1);
  border-top: ${(props) => props.thickness}px solid
    ${(props) => props.theme.colors.primary};
  border-radius: 50%;
  animation: ${spin} ${(props) => props.speed}s linear infinite;
`;

export default LoadingSpinner;
