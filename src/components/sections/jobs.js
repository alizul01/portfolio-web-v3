import React, { useState, useEffect, useRef } from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import { CSSTransition } from 'react-transition-group';
import styled from 'styled-components';
import { srConfig } from '@config';
import { KEY_CODES } from '@utils';
import sr from '@utils/sr';
import { usePrefersReducedMotion } from '@hooks';
import { Icon } from '@components/icons';

const StyledJobsSection = styled.section`
  max-width: 700px;

  .inner {
    display: flex;

    @media (max-width: 600px) {
      display: block;
    }

    // Prevent container from jumping
    @media (min-width: 700px) {
      min-height: 340px;
    }
  }
`;

const StyledTabList = styled.div`
  position: relative;
  z-index: 3;
  width: max-content;
  padding: 0;
  margin: 0;
  list-style: none;

  @media (max-width: 600px) {
    display: flex;
    overflow-x: auto;
    width: calc(100% + 100px);
    padding-left: 50px;
    margin-left: -50px;
    margin-bottom: 30px;
  }
  @media (max-width: 480px) {
    width: calc(100% + 50px);
    padding-left: 25px;
    margin-left: -25px;
  }

  li {
    &:first-of-type {
      @media (max-width: 600px) {
        margin-left: 50px;
      }
      @media (max-width: 480px) {
        margin-left: 25px;
      }
    }
    &:last-of-type {
      @media (max-width: 600px) {
        padding-right: 50px;
      }
      @media (max-width: 480px) {
        padding-right: 25px;
      }
    }
  }
`;

const StyledTabButton = styled.button`
  ${({ theme }) => theme.mixins.link};
  display: flex;
  align-items: center;
  width: 100%;
  height: var(--tab-height);
  padding: 0 20px 2px;
  border-left: 2px solid var(--lightest-navy);
  background-color: transparent;
  color: ${({ isActive }) => (isActive ? 'var(--green)' : 'var(--slate)')};
  font-family: var(--font-mono);
  font-size: var(--fz-xs);
  text-align: left;
  white-space: nowrap;

  @media (max-width: 768px) {
    padding: 0 15px 2px;
  }
  @media (max-width: 600px) {
    ${({ theme }) => theme.mixins.flexCenter};
    min-width: 120px;
    padding: 0 15px;
    border-left: 0;
    border-bottom: 2px solid var(--lightest-navy);
    text-align: center;
  }

  &:hover,
  &:focus {
    background-color: var(--light-navy);
  }
`;

const StyledHighlight = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  width: 2px;
  height: var(--tab-height);
  border-radius: var(--border-radius);
  background: var(--green);
  transform: translateY(calc(${({ activeTabId }) => activeTabId} * var(--tab-height)));
  transition: transform 0.25s cubic-bezier(0.645, 0.045, 0.355, 1);
  transition-delay: 0.1s;

  @media (max-width: 600px) {
    top: auto;
    bottom: 0;
    width: 100%;
    max-width: var(--tab-width);
    height: 2px;
    margin-left: 50px;
    transform: translateX(calc(${({ activeTabId }) => activeTabId} * var(--tab-width)));
  }
  @media (max-width: 480px) {
    margin-left: 25px;
  }
`;

const StyledTabPanels = styled.div`
  position: relative;
  width: 100%;
  margin-left: 20px;

  @media (max-width: 600px) {
    margin-left: 0;
  }
`;

const StyledTabPanel = styled.div`
  width: 100%;
  height: auto;
  padding: 10px 5px;

  ul {
    ${({ theme }) => theme.mixins.fancyList};
  }

  h3 {
    margin-bottom: 2px;
    font-size: var(--fz-xxl);
    font-weight: 500;
    line-height: 1.3;

    .company {
      color: var(--green);
    }
  }

  .company-header {
    color: var(--green);
    margin-bottom: 10px;
    font-size: var(--fz-xl);

    a {
      color: var(--green);
    }
  }

  .range {
    margin-bottom: 25px;
    color: var(--light-slate);
    font-family: var(--font-mono);
    font-size: var(--fz-xs);
  }

  .show-more-btn {
    background: transparent;
    border: none;
    color: var(--green);
    font-family: var(--font-mono);
    font-size: var(--fz-sm);
    cursor: pointer;
    padding: 5px 0;
    margin-top: 10px;
    position: relative;

    &:after {
      content: '';
      display: block;
      width: 0;
      height: 1px;
      position: relative;
      bottom: -2px;
      background-color: var(--green);
      opacity: 0.5;
      transition: all 0.2s ease;
    }

    &:hover:after {
      width: 100%;
    }
  }

  // Job content layout for all screen sizes
  .job-content {
    display: flex;
    flex-direction: row;
    align-items: flex-start;

    .job-icon {
      flex-shrink: 0;
      margin-right: 20px;
      margin-top: 5px;
      color: var(--green);

      svg {
        width: 22px;
        height: 22px;
      }
    }

    .job-details {
      flex: 1;
    }
  }
`;

const Jobs = () => {
  const data = useStaticQuery(graphql`
    query {
      jobs: allMarkdownRemark(
        filter: { fileAbsolutePath: { regex: "/content/jobs/" } }
        sort: { fields: [frontmatter___date], order: DESC }
      ) {
        edges {
          node {
            frontmatter {
              title
              company
              location
              range
              url
            }
            html
          }
        }
      }
    }
  `);

  const jobsData = data.jobs.edges;

  const [activeTabId, setActiveTabId] = useState(0);
  const [tabFocus, setTabFocus] = useState(null);
  const tabs = useRef([]);
  const revealContainer = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    sr.reveal(revealContainer.current, srConfig());
  }, []);

  useEffect(() => {
    // Check if we're on mobile
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const focusTab = () => {
    if (tabs.current[tabFocus]) {
      tabs.current[tabFocus].focus();
      return;
    }
    // If we're at the end, go to the start
    if (tabFocus >= tabs.current.length) {
      setTabFocus(0);
    }
    // If we're at the start, move to the end
    if (tabFocus < 0) {
      setTabFocus(tabs.current.length - 1);
    }
  };

  // Only re-run the effect if tabFocus changes
  useEffect(() => focusTab(), [tabFocus]);

  // Focus on tabs when using up & down arrow keys
  const onKeyDown = e => {
    switch (e.key) {
      case KEY_CODES.ARROW_UP: {
        e.preventDefault();
        setTabFocus(tabFocus - 1);
        break;
      }

      case KEY_CODES.ARROW_DOWN: {
        e.preventDefault();
        setTabFocus(tabFocus + 1);
        break;
      }

      default: {
        break;
      }
    }
  };

  // Function to determine which icon to use for the job
  const getJobIcon = (company) => {
    // You can customize this logic to map company names to specific icons
    // For example, map specific companies to different icons
    if (company.toLowerCase().includes('agate')) {
      return 'GameController';
    } else if (company.toLowerCase().includes('enigmates')) {
      return 'Game';
    } else if (company.toLowerCase().includes('state')) {
      return 'Education';
    }
    // Default to a briefcase icon
    return 'Briefcase';
  };

  // Function to handle the show more/less toggle for job descriptions on mobile
  const JobDescription = ({ html }) => {
    const [showAll, setShowAll] = useState(false);
    const contentRef = useRef(null);

    // Only do this processing on mobile
    if (!isMobile) {
      return <div dangerouslySetInnerHTML={{ __html: html }} />;
    }

    // Process HTML to extract list items
    const processHTML = () => {
      // Create a temporary div to parse the HTML
      const temp = document.createElement('div');
      temp.innerHTML = html;

      // Find all list items
      const listItems = temp.querySelectorAll('li');
      const totalItems = listItems.length;

      // If there are 3 or fewer items, no need for show more/less
      if (totalItems <= 3) {
        return {
          fullHtml: html,
          limitedHtml: html,
          hasMore: false
        };
      }

      // Create a copy of the HTML with only the first 3 list items
      const tempLimited = temp.cloneNode(true);
      const limitedListItems = tempLimited.querySelectorAll('li');

      // Remove all list items after the third one
      for (let i = 3; i < limitedListItems.length; i++) {
        limitedListItems[i].remove();
      }

      return {
        fullHtml: html,
        limitedHtml: tempLimited.innerHTML,
        hasMore: true
      };
    };

    // Memoize this calculation to avoid reprocessing on every render
    const { fullHtml, limitedHtml, hasMore } = React.useMemo(processHTML, [html]);

    if (!hasMore) {
      return <div dangerouslySetInnerHTML={{ __html: html }} />;
    }

    return (
      <>
        <div
          ref={contentRef}
          dangerouslySetInnerHTML={{ __html: showAll ? fullHtml : limitedHtml }}
        />
        {hasMore && (
          <button
            className="show-more-btn"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show Less' : 'Show All'}
          </button>
        )}
      </>
    );
  };

  return (
    <StyledJobsSection id="jobs" ref={revealContainer}>
      <h2 className="numbered-heading">Past Experience</h2>

      <div className="inner">
        {/* Only show tabs on desktop */}
        {!isMobile && (
          <StyledTabList role="tablist" aria-label="Job tabs" onKeyDown={e => onKeyDown(e)}>
            {jobsData &&
              jobsData.map(({ node }, i) => {
                const { company } = node.frontmatter;
                return (
                  <StyledTabButton
                    key={i}
                    isActive={activeTabId === i}
                    onClick={() => setActiveTabId(i)}
                    ref={el => (tabs.current[i] = el)}
                    id={`tab-${i}`}
                    role="tab"
                    tabIndex={activeTabId === i ? '0' : '-1'}
                    aria-selected={activeTabId === i}
                    aria-controls={`panel-${i}`}>
                    <span>{company}</span>
                  </StyledTabButton>
                );
              })}
            <StyledHighlight activeTabId={activeTabId} />
          </StyledTabList>
        )}

        <StyledTabPanels>
          {jobsData &&
            jobsData.map(({ node }, i) => {
              const { frontmatter, html } = node;
              const { title, url, company, range } = frontmatter;
              const iconName = getJobIcon(company);

              // On mobile, show all panels; on desktop, only show the active one
              const isVisible = isMobile || activeTabId === i;

              return (
                <CSSTransition key={i} in={isVisible} timeout={250} classNames="fade">
                  <StyledTabPanel
                    id={`panel-${i}`}
                    role="tabpanel"
                    tabIndex={isVisible ? '0' : '-1'}
                    aria-labelledby={`tab-${i}`}
                    aria-hidden={!isVisible}
                    hidden={!isVisible}
                    style={{
                      display: isVisible ? 'block' : 'none',
                      marginBottom: isMobile ? '50px' : '0'
                    }}>

                    <div className="job-content">
                      <div className="job-icon">
                        <Icon name={iconName} />
                      </div>
                      <div className="job-details">
                        {/* If on mobile, show the company name as a header for each job */}
                        {isMobile && (
                          <h3 className="company-header">
                            <a href={url} className="inline-link">
                              {company}
                            </a>
                          </h3>
                        )}

                        <h3>
                          <span>{title}</span>
                          {!isMobile && (
                            <span className="company">
                              &nbsp;@&nbsp;
                              <a href={url} className="inline-link">
                                {company}
                              </a>
                            </span>
                          )}
                        </h3>

                        <p className="range">{range}</p>

                        <JobDescription html={html} />
                      </div>
                    </div>
                  </StyledTabPanel>
                </CSSTransition>
              );
            })}
        </StyledTabPanels>
      </div>
    </StyledJobsSection>
  );
};

export default Jobs;
