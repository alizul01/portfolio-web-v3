import React, { useEffect, useRef } from 'react';
import { StaticImage } from 'gatsby-plugin-image';
import styled from 'styled-components';
import { srConfig } from '@config';
import sr from '@utils/sr';
import { usePrefersReducedMotion } from '@hooks';

const StyledAboutSection = styled.section`
  max-width: 900px;

  .inner {
    display: grid;
    grid-template-columns: 3fr 2fr;
    grid-gap: 50px;

    @media (max-width: 768px) {
      display: block;
    }
  }
`;
const StyledText = styled.div`
  ul.skills-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(140px, 200px));
    grid-gap: 0 10px;
    padding: 0;
    margin: 20px 0 0 0;
    overflow: hidden;
    list-style: none;

    li {
      position: relative;
      margin-bottom: 10px;
      padding-left: 20px;
      font-family: var(--font-mono);
      font-size: var(--fz-xs);

      &:before {
        content: '▹';
        position: absolute;
        left: 0;
        color: var(--green);
        font-size: var(--fz-sm);
        line-height: 12px;
      }
    }
  }
`;
const StyledPic = styled.div`
  position: relative;
  max-width: 300px;

  @media (max-width: 768px) {
    margin: 50px auto 0;
    width: 70%;
  }

  .wrapper {
    ${({ theme }) => theme.mixins.boxShadow};
    display: block;
    position: relative;
    width: 100%;
    border-radius: var(--border-radius);
    background-color: var(--green);

    &:hover,
    &:focus {
      outline: 0;
      transform: translate(-4px, -4px);

      &:after {
        transform: translate(8px, 8px);
      }

      .img {
        filter: none;
        mix-blend-mode: normal;
      }
    }

    .img {
      position: relative;
      border-radius: var(--border-radius);
      mix-blend-mode: multiply;
      filter: grayscale(100%) contrast(1);
      transition: var(--transition);
    }

    &:before,
    &:after {
      content: '';
      display: block;
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: var(--border-radius);
      transition: var(--transition);
    }

    &:before {
      top: 0;
      left: 0;
      background-color: var(--navy);
      mix-blend-mode: screen;
    }

    &:after {
      border: 2px solid var(--green);
      top: 14px;
      left: 14px;
      z-index: -1;
    }
  }
`;

const About = () => {
  const revealContainer = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    sr.reveal(revealContainer.current, srConfig());
  }, []);

  const skills = ['Unity (mainly)', 'C#', 'Game Design', 'Unreal Engine 4 (learning)', 'Blender 3D', 'React/Next.js'];

  return (
    <StyledAboutSection id="about" ref={revealContainer}>
      <h2 className="numbered-heading">About Me</h2>

      <div className="inner">
        <StyledText>
          <div>
            <p>
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              Hello! I'm <a> Ali Zulfikar </a>, a game developer associate with a passion for creating impactful game
              experiences.
              I've been develop my soft and technical skills in game development, leadership, and also public speaking.
            </p>

            <p>
              In 2025, I've fully committed to game development and I am currently building {' '}
              <a href="https://ariversestudio.com"> Ariverse Studio</a> as a leader and general management thingy.
            </p>

            <p>
              My journey has been marked by several achievements in Game Development and Innovation, including{' '}
              <a href="https://www.credly.com/badges/9e9e5e79-777a-4c78-835a-493b643e3478/linked_in_profile"> Unity Certified Associate: Game Developer </a>,{' '}
              <a href="https://gemastik.kemdikbud.go.id/">4th Winner Gemastik 2023</a>,{' '}
              <a href="https://kompetisi4c.ub.ac.id/">3rd Winner 4C Competition</a>, and participation in{' '}
              <a href="https://igdx.id">IGDX Business Pass 2024</a>.
            </p>

            <p>
              Also, I had the opportunity to be a Mentee at{' '}
              <a href="https://agate.id/">Agate Academy SI Batch 6</a>{' '}
              which educated me about the game industry and how to be a professional game developer.
              {' '}
            </p>

            <p>These are the technologies I'm currently working with:</p>
          </div>

          <ul className="skills-list">
            {skills && skills.map((skill, i) => <li key={i}>{skill}</li>)}
          </ul>
        </StyledText>

        <StyledPic>
          <div className="wrapper">
            <StaticImage
              className="img"
              src="../../images/me.jpg"
              width={500}
              quality={95}
              alt="Profile picture"
            />
          </div>
        </StyledPic>
      </div>
    </StyledAboutSection>
  );
};

export default About;
