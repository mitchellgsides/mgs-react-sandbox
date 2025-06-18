import styled from "styled-components";
import { Button as MuiButton } from "@mui/material";

type Props = {
  label: string;
  onClick: () => void;
  dataTag: string;
};

const Button = ({ label, onClick, dataTag }: Props) => {
  return (
    <StyledButton data-testid={`button-${dataTag}`} onClick={onClick}>
      {label}
    </StyledButton>
  );
};

export default Button;

const StyledButton = styled(MuiButton)``;
