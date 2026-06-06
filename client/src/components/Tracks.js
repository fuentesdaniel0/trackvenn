import React from "react"
import styled from "@emotion/styled"

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
`

const TrackCard = styled.div`
  background: var(--bg-glass);
  border: 1px solid var(--border-glass);
  border-radius: 12px;
  padding: 15px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;

  &:hover {
    transform: translateY(-5px);
    background: var(--bg-glass-hover);
    border-color: var(--accent-primary);
    box-shadow: 0 10px 30px var(--accent-shadow-light);
  }

  &:hover .cover-glow::before {
    opacity: 0.6;
  }
`

const CoverArtContainer = styled.div`
  position: relative;
  width: 150px;
  height: 150px;
  margin-bottom: 15px;

  &::before {
    content: '';
    position: absolute;
    top: 5px;
    left: 5px;
    right: 5px;
    bottom: -5px;
    background: var(--accent-primary);
    filter: blur(15px);
    opacity: 0;
    transition: opacity 0.3s ease;
    border-radius: 8px;
    z-index: 0;
  }
`

const CoverArt = styled.img`
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  z-index: 1;
`

const TrackName = styled.h4`
  margin: 0 0 5px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
`

const ArtistName = styled.p`
  margin: 0 0 10px 0;
  font-size: 14px;
  color: var(--text-secondary);
`

const AlbumName = styled.span`
  font-size: 12px;
  color: var(--text-secondary);
  opacity: 0.7;
`

const Tracks = ({ trackList }) => {
  if (!trackList || trackList.length === 0) {
    return <div>No tracks in common D:</div>
  }

  return (
    <Grid className="stagger-container">
      {trackList.map((track, i) => (
        <TrackCard key={i} style={{ "--sibling-index": i + 1 }}>
          {track.album?.images?.[1] && (
            <CoverArtContainer className="cover-glow">
              <CoverArt
                src={track.album.images[1].url}
                alt="album cover"
                loading="lazy"
              />
            </CoverArtContainer>
          )}
          <TrackName>{track.name}</TrackName>
          <ArtistName>{track.artists?.map(el => el.name).join(", ")}</ArtistName>
          <AlbumName>{track.album?.name}</AlbumName>
        </TrackCard>
      ))}
    </Grid>
  )
}

export default Tracks
