import React from "react"
import styled from "@emotion/styled"

const SelectionContainer = styled.div`
  margin-bottom: 20px;
`

const Title = styled.h3`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 15px;
`

const CardGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
`

const UserCard = styled.label`
  display: block;
  cursor: pointer;
  position: relative;
`

const RadioInput = styled.input`
  position: absolute;
  opacity: 0;
  cursor: pointer;

  &:checked + div {
    background: var(--accent-bg-light);
    border-color: var(--accent-primary);
    transform: scale(1.05);
    box-shadow: 0 0 15px var(--accent-shadow-light);
  }
`

const CardContent = styled.div`
  background: var(--bg-glass);
  border: 1px solid var(--border-glass);
  padding: 15px 30px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  color: var(--text-primary);
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);

  &:hover {
    background: var(--bg-glass-hover);
  }
`

const UserSelection = ({ availableUsers, intersectionWith, setIntersectionWith }) => {
  return (
    <SelectionContainer>
      <Title>
        {availableUsers.length > 0
          ? "Compare liked songs with:"
          : "No other users to compare with yet."}
      </Title>
      <CardGrid>
        {availableUsers.map((user, i) => (
          <UserCard key={i}>
            <RadioInput
              type="radio"
              name="user"
              value={user}
              checked={intersectionWith === user}
              onChange={(e) => setIntersectionWith(e.target.value)}
            />
            <CardContent>{user}</CardContent>
          </UserCard>
        ))}
      </CardGrid>
    </SelectionContainer>
  )
}

export default UserSelection
