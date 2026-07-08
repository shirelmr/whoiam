const React = require('react');
const { useState, useEffect } = React;
const { render, Box, Text, useStdout, useInput } = require('ink');
const Spinner = require('ink-spinner').default;

const asciiArt = [
  '::::::::::::::::::::::::',
  '::::::::::::::::::::::::',
  '::::::.        .::::::::',
  ':::::.          ::::::::',
  ':::::.    ..    ::::::::',
  ':::::.   ....   ::::::::',
  '::::::.        .::::::::',
  '::::::::::::::::::::::::',
];

const bioLines = [
  { text: 'Shirel Marino ', color: 'cyan' },
  { text: 'building cool products.', color: 'cyan' },
  { text: '', color: 'white' },
  { text: "CS @ ITESM'27", dim: true },
  { text: 'SWE @ Microsoft', dim: true },
];

const nav = ['About', 'Links'];

const useFullscreen = () => {
  useEffect(() => {
    process.stdout.write('\x1b[?1049h');
    process.stdout.write('\x1b[2J');
    process.stdout.write('\x1b[?25l');

    return () => {
      process.stdout.write('\x1b[?25h');
      process.stdout.write('\x1b[0m');
      process.stdout.write('\x1b[?1049l');
    };
  }, []);
};

const Loading = () => (
  <Box>
    <Text color="red">
      <Spinner type="dots" />
    </Text>
    <Text> Loading...</Text>
  </Box>
);

const StaggeredBio = ({ lines }) => {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (visibleCount >= lines.length) return;
    const timer = setTimeout(() => setVisibleCount((c) => c + 1), 250);
    return () => clearTimeout(timer);
  }, [visibleCount]);

  return (
    <Box flexDirection="column">
      {lines.map((line, i) => (
        <Text key={i} color={line.color} dimColor={line.dim}>
          {i < visibleCount ? (line.text || ' ') : ' '}
        </Text>
      ))}
    </Box>
  );
};

const NavBar = ({ items, activeIndex }) => (
  <Box width="100%" justifyContent="space-between">
    <Box>
      {items.map((item, i) => (
        <React.Fragment key={item}>
          {i > 0 && <Text>{'  '}</Text>}
          <Text color={i === activeIndex ? 'red' : undefined} bold={i === activeIndex}>
            {item}
          </Text>
        </React.Fragment>
      ))}
    </Box>
    <Text dimColor color="red">[under construction]</Text>
  </Box>
);

const Footer = () => (
  <Box width="100%" justifyContent="space-between">
    <Text dimColor>v0.0.1</Text>
    <Box>
      <Text dimColor><Text color="red">←→</Text> navigate</Text>
      <Text>{'  '}</Text>
      <Text dimColor><Text color="red">←</Text> back</Text>
      <Text>{'  '}</Text>
      <Text dimColor><Text color="red">q</Text> quit</Text>
    </Box>
  </Box>
);

const AboutView = () => (
  <Box flexDirection="row" gap={2} justifyContent="center" alignItems="center">
    <Box flexDirection="column">
      {asciiArt.map((row, i) => (
        <Text key={i} dimColor>{row}</Text>
      ))}
    </Box>
    <StaggeredBio lines={bioLines} />
  </Box>
);

const LinksView = () => (
  <Box justifyContent="center" alignItems="center">
    <Text color="cyan">shirelmr</Text>
  </Box>
);

const App = () => {
  useFullscreen();

  const { stdout } = useStdout();
  const [phase, setPhase] = useState('loading');
  const [activeIndex, setActiveIndex] = useState(0);
  const [, forceRerender] = useState(0);

  useEffect(() => {
    const onResize = () => forceRerender((n) => n + 1);
    stdout.on('resize', onResize);
    return () => stdout.off('resize', onResize);
  }, [stdout]);

  useEffect(() => {
    if (phase === 'loading') {
      const timer = setTimeout(() => setPhase('ready'), 1500);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  useInput((input, key) => {
    if (phase !== 'ready') return;
    if (input === 'q') process.exit(0);
    if (key.rightArrow) setActiveIndex((i) => Math.min(nav.length - 1, i + 1));
    if (key.leftArrow) setActiveIndex((i) => Math.max(0, i - 1));
  });

  const width = stdout.columns || 80;
  const height = stdout.rows || 24;

  if (phase === 'loading') {
    return (
      <Box width={width} height={height} justifyContent="center" alignItems="center">
        <Loading />
      </Box>
    );
  }

  return (
    <Box
      width={width}
      height={height}
      flexDirection="column"
      paddingX={2}
      paddingY={1}
    >
      <NavBar items={nav} activeIndex={activeIndex} />
      <Box flexGrow={1} justifyContent="center" alignItems="center">
        {activeIndex === 0 ? <AboutView /> : <LinksView />}
      </Box>
      <Footer />
    </Box>
  );
};

render(<App />);
