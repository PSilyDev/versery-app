import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled, { css, keyframes } from "styled-components";
import { faArrowRight, faSearch } from "@fortawesome/free-solid-svg-icons";

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

export const Container = styled.div`
  margin-right: 80px;
  position: relative;
  width: 50px;
  height: 50px;
  box-sizing: border-box;
  border-radius: 50px;
  padding: 5px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: all 0.6s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row; /* ✅ FIXED */
  gap: 8px;             /* optional */
  border: 1px solid rgba(255, 255, 255, 0.3);

  ${({ hover }) =>
    hover &&
    css`
      width: 50%;
      border-radius: 16px;
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.3);

      @media (min-width: 768px) {
        width: 80%;
      }
    `}
`;


export const SearchInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: white;
  font-size: 16px;
  padding: 8px 12px;
  display: ${({ showSearchInput }) => (showSearchInput ? 'block' : 'none')};
  opacity: ${(props) => (props.showSearchInput ? 1 : 0)};
  transform: ${(props) => (props.showSearchInput ? 'translateY(0)' : 'translateY(-5px)')};
  transition: opacity 0.3s ease-out, transform 0.3s ease-out;
  pointer-events: ${(props) => (props.showSearchInput ? 'auto' : 'none')};
  background: transparent;
  color: #1e1e1e;

  &::placeholder {
    color: #888;
    font-size: 0.95rem;
  }
`;

export const IconMagnifyingGlass = styled(FontAwesomeIcon)`
  font-size: 18px;
  color: #1e1e1e;
  z-index: 10;
  animation: ${fadeIn} 0.4s ease-in-out;
  cursor: pointer;
  font-size: 20px;
  
`;

export const IconRightArrow = styled(FontAwesomeIcon)`
  font-size: 18px;
  color: #1e1e1e;
  z-index: 10;
  cursor: pointer;
  animation: ${fadeIn} 0.4s ease-in-out;
  align-self: center; /* ✅ FIXED */
  margin-left: auto;  /* Optional: pushes arrow to right side */
  margin-right: 8px;  /* Optional: spacing from edge */

  &:hover {
    color: #333;
  }
`;
