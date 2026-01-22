# Component Usage Examples

## Complete Page Examples

### Home Page
```tsx
// app/designs/[design-id]/page.tsx
import { ThemedHomePage } from '@/designs/components';

export default function HomePage() {
  return <ThemedHomePage />;
}
```

### Game Page
```tsx
// app/designs/[design-id]/play/page.tsx
import { ThemedGamePage } from '@/designs/components';

export default function PlayPage() {
  return <ThemedGamePage />;
}
```

### Custom Page with Layout
```tsx
// app/designs/[design-id]/custom/page.tsx
import { ThemedLayout, ThemedNavBar } from '@/designs/components';

export default function CustomPage() {
  return (
    <ThemedLayout>
      <ThemedNavBar />
      <main>
        {/* Your content */}
      </main>
    </ThemedLayout>
  );
}
```

---

## Individual Component Examples

### Buttons
```tsx
import { ThemedButton } from '@/designs/components';

function ButtonExamples() {
  return (
    <>
      {/* Primary Button */}
      <ThemedButton
        variant="primary"
        size="lg"
        onClick={() => console.log('clicked')}
      >
        Play Now
      </ThemedButton>

      {/* Secondary Button */}
      <ThemedButton
        variant="secondary"
        size="md"
      >
        Settings
      </ThemedButton>

      {/* Ghost Button */}
      <ThemedButton
        variant="ghost"
        size="sm"
      >
        Cancel
      </ThemedButton>

      {/* Full Width */}
      <ThemedButton
        variant="primary"
        fullWidth
      >
        Continue
      </ThemedButton>

      {/* Disabled */}
      <ThemedButton
        variant="primary"
        disabled
      >
        Loading...
      </ThemedButton>
    </>
  );
}
```

### Cards
```tsx
import { ThemedCard } from '@/designs/components';

function CardExamples() {
  return (
    <>
      {/* Basic Card */}
      <ThemedCard>
        <h2>Title</h2>
        <p>Content goes here</p>
      </ThemedCard>

      {/* Card with Glow */}
      <ThemedCard glow>
        <h2>Featured Content</h2>
      </ThemedCard>

      {/* Hoverable Card */}
      <ThemedCard hoverable>
        <h2>Hover Me</h2>
      </ThemedCard>

      {/* Clickable Card */}
      <ThemedCard
        clickable
        onClick={() => console.log('clicked')}
      >
        <h2>Click Me</h2>
      </ThemedCard>

      {/* Custom Padding */}
      <ThemedCard padding="lg">
        <h2>Large Padding</h2>
      </ThemedCard>
    </>
  );
}
```

### Progress Bars
```tsx
import { ThemedProgressBar } from '@/designs/components';

function ProgressExamples() {
  return (
    <>
      {/* Basic Progress */}
      <ThemedProgressBar value={750} max={1000} />

      {/* With Label */}
      <ThemedProgressBar
        value={750}
        max={1000}
        label="XP Progress"
      />

      {/* With Percentage */}
      <ThemedProgressBar
        value={750}
        max={1000}
        showPercentage
      />

      {/* Different Colors */}
      <ThemedProgressBar value={80} max={100} color="success" />
      <ThemedProgressBar value={50} max={100} color="warning" />
      <ThemedProgressBar value={20} max={100} color="error" />

      {/* Different Sizes */}
      <ThemedProgressBar value={50} max={100} size="sm" />
      <ThemedProgressBar value={50} max={100} size="md" />
      <ThemedProgressBar value={50} max={100} size="lg" />

      {/* Complete Example */}
      <ThemedProgressBar
        value={1847}
        max={2000}
        label="Level Progress"
        showPercentage
        color="primary"
        size="lg"
      />
    </>
  );
}
```

---

## Home Page Components

### Hero Section
```tsx
import { ThemedHeroSection } from '@/designs/components';

function HomePage() {
  return (
    <div>
      <ThemedHeroSection />
      {/* Rest of page */}
    </div>
  );
}
```

### Profile Preview
```tsx
import { ThemedProfilePreview } from '@/designs/components';

function ProfileSection() {
  return (
    <ThemedProfilePreview
      username="ProPlayer123"
      rank="GOLD"
      level={24}
      xp={1847}
      maxXp={2000}
      wins={142}
      losses={89}
    />
  );
}
```

### Season Banner
```tsx
import { ThemedSeasonBanner } from '@/designs/components';

function SeasonSection() {
  return (
    <ThemedSeasonBanner
      seasonName="Winter Championship"
      seasonNumber={5}
      daysLeft={23}
      currentTier={7}
      maxTier={10}
    />
  );
}
```

### Quick Links
```tsx
import { ThemedQuickLinks } from '@/designs/components';

function QuickActions() {
  return <ThemedQuickLinks />;
}
```

### Complete Home Layout
```tsx
import {
  ThemedHeroSection,
  ThemedProfilePreview,
  ThemedSeasonBanner,
  ThemedQuickLinks,
} from '@/designs/components';

function CustomHomePage() {
  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      <ThemedHeroSection />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '2rem',
        marginTop: '3rem'
      }}>
        <div>
          <ThemedProfilePreview
            username="Player"
            rank="GOLD"
            level={24}
            xp={1847}
            maxXp={2000}
            wins={142}
            losses={89}
          />
          <div style={{ marginTop: '2rem' }}>
            <ThemedSeasonBanner
              seasonName="Winter Championship"
              seasonNumber={5}
              daysLeft={23}
              currentTier={7}
              maxTier={10}
            />
          </div>
        </div>

        <div>
          <h2>Quick Play</h2>
          <ThemedQuickLinks />
        </div>
      </div>
    </div>
  );
}
```

---

## Game Page Components

### Mode Selector
```tsx
import { ThemedModeSelector } from '@/designs/components';

function ModeSelection() {
  const handleModeSelect = (mode: 'ai' | 'multiplayer') => {
    console.log('Selected mode:', mode);
  };

  return <ThemedModeSelector onSelect={handleModeSelect} />;
}
```

### Difficulty Selector
```tsx
import { ThemedDifficultySelector } from '@/designs/components';

function DifficultySelection() {
  const handleSelect = (difficulty: 'easy' | 'medium' | 'hard') => {
    console.log('Selected difficulty:', difficulty);
  };

  const handleBack = () => {
    console.log('Going back');
  };

  return (
    <ThemedDifficultySelector
      onSelect={handleSelect}
      onBack={handleBack}
    />
  );
}
```

### Countdown
```tsx
import { ThemedCountdown } from '@/designs/components';
import { useState, useEffect } from 'react';

function CountdownExample() {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => setCount(count - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [count]);

  return <ThemedCountdown count={count} />;
}
```

### Pause Menu
```tsx
import { ThemedPauseMenu } from '@/designs/components';

function PausedGame() {
  return (
    <ThemedPauseMenu
      onResume={() => console.log('Resume')}
      onRestart={() => console.log('Restart')}
      onQuit={() => console.log('Quit')}
    />
  );
}
```

### Game Over
```tsx
import { ThemedGameOver } from '@/designs/components';

function GameResults() {
  return (
    <ThemedGameOver
      winner="player"
      playerScore={7}
      opponentScore={5}
      xpGained={250}
      levelUp={true}
      newLevel={25}
      onPlayAgain={() => console.log('Play again')}
      onQuit={() => console.log('Quit')}
    />
  );
}
```

### Custom Game Flow
```tsx
import { useState } from 'react';
import {
  ThemedModeSelector,
  ThemedDifficultySelector,
  ThemedCountdown,
  ThemedPauseMenu,
  ThemedGameOver,
} from '@/designs/components';

type GameState = 'mode' | 'difficulty' | 'countdown' | 'playing' | 'paused' | 'over';

function CustomGameFlow() {
  const [state, setState] = useState<GameState>('mode');
  const [mode, setMode] = useState<'ai' | 'multiplayer' | null>(null);

  switch (state) {
    case 'mode':
      return (
        <ThemedModeSelector
          onSelect={(m) => {
            setMode(m);
            setState(m === 'ai' ? 'difficulty' : 'countdown');
          }}
        />
      );

    case 'difficulty':
      return (
        <ThemedDifficultySelector
          onSelect={() => setState('countdown')}
          onBack={() => setState('mode')}
        />
      );

    case 'countdown':
      return <ThemedCountdown count={3} />;

    case 'playing':
      return <div>Game Canvas Here</div>;

    case 'paused':
      return (
        <ThemedPauseMenu
          onResume={() => setState('playing')}
          onRestart={() => setState('countdown')}
          onQuit={() => setState('mode')}
        />
      );

    case 'over':
      return (
        <ThemedGameOver
          winner="player"
          playerScore={7}
          opponentScore={5}
          xpGained={250}
          onPlayAgain={() => setState('countdown')}
          onQuit={() => setState('mode')}
        />
      );
  }
}
```

---

## Advanced: Custom Styled Components

### Using Design Styles Directly
```tsx
import { useDesignStyles } from '@/designs/useDesignStyles';
import { useDesign } from '@/designs/DesignContext';

function CustomComponent() {
  const styles = useDesignStyles();
  const { config } = useDesign();

  return (
    <div
      style={{
        backgroundColor: styles.colors.bg.primary,
        color: styles.colors.text.primary,
        fontFamily: styles.fonts.body,
        padding: '2rem',
        borderRadius: styles.borderRadius.lg,
        border: `1px solid ${styles.colors.border.subtle}`,
        boxShadow: styles.shadows.card,
      }}
    >
      <h1
        style={{
          fontFamily: styles.fonts.heading,
          fontSize: styles.fontSize['4xl'],
          color: styles.colors.primary,
          textShadow: config.effects.glowIntensity > 15
            ? styles.shadows.glowText(styles.colors.primary)
            : 'none',
        }}
      >
        {config.name}
      </h1>
      <p style={{ color: styles.colors.text.secondary }}>
        Custom themed content
      </p>
    </div>
  );
}
```

### Conditional Effects
```tsx
function EffectsExample() {
  const styles = useDesignStyles();
  const { config } = useDesign();

  return (
    <div>
      {/* Apply glow only for high-intensity designs */}
      <div
        style={{
          boxShadow: styles.effects.glowIntensity > 15
            ? styles.shadows.glowStrong(styles.colors.primary)
            : 'none',
        }}
      >
        Conditional Glow
      </div>

      {/* Scanlines overlay */}
      {config.effects.scanlines && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundImage: 'linear-gradient(0deg, transparent 50%, rgba(0, 0, 0, 0.1) 50%)',
            backgroundSize: '100% 4px',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Light theme handling */}
      <button
        style={{
          backgroundColor: styles.colors.primary,
          color: config.id === 'arctic-frost'
            ? styles.colors.bg.primary
            : '#ffffff',
        }}
      >
        Button
      </button>
    </div>
  );
}
```

---

## Responsive Patterns

### Grid Layouts
```tsx
function ResponsiveGrid() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
      }}
    >
      {/* Cards automatically wrap */}
    </div>
  );
}
```

### Flex Layouts
```tsx
function ResponsiveFlex() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '1rem',
        '@media (max-width: 768px)': {
          flexDirection: 'column',
        },
      }}
    >
      {/* Content */}
    </div>
  );
}
```

---

## Animation Patterns

### Framer Motion Entrance
```tsx
import { motion } from 'framer-motion';

function AnimatedEntrance() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      Content fades in from below
    </motion.div>
  );
}
```

### Staggered Children
```tsx
import { motion } from 'framer-motion';

function StaggeredList() {
  const items = ['Item 1', 'Item 2', 'Item 3'];

  return (
    <div>
      {items.map((item, index) => (
        <motion.div
          key={item}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          {item}
        </motion.div>
      ))}
    </div>
  );
}
```

### Hover Effects
```tsx
import { motion } from 'framer-motion';

function HoverCard() {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
    >
      Hover me
    </motion.div>
  );
}
```

---

## Testing Examples

### Component Test
```tsx
import { render, screen } from '@testing-library/react';
import { DesignProvider } from '@/designs/DesignContext';
import { ThemedButton } from '@/designs/components';

test('renders button with text', () => {
  render(
    <DesignProvider>
      <ThemedButton>Click Me</ThemedButton>
    </DesignProvider>
  );

  expect(screen.getByText('Click Me')).toBeInTheDocument();
});
```

### Interaction Test
```tsx
import { render, fireEvent } from '@testing-library/react';
import { ThemedButton } from '@/designs/components';
import { DesignProvider } from '@/designs/DesignContext';

test('calls onClick when clicked', () => {
  const handleClick = jest.fn();

  const { getByText } = render(
    <DesignProvider>
      <ThemedButton onClick={handleClick}>Click</ThemedButton>
    </DesignProvider>
  );

  fireEvent.click(getByText('Click'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

---

## Best Practices

1. **Always wrap in DesignProvider**
   ```tsx
   <DesignProvider>
     <YourComponents />
   </DesignProvider>
   ```

2. **Use useDesignStyles() for theming**
   ```tsx
   const styles = useDesignStyles();
   ```

3. **Check light theme when setting text colors**
   ```tsx
   color: config.id === 'arctic-frost' ? styles.colors.bg.primary : '#ffffff'
   ```

4. **Apply effects conditionally**
   ```tsx
   boxShadow: styles.effects.glowIntensity > 15 ? styles.shadows.glow(color) : 'none'
   ```

5. **Use motion components for animations**
   ```tsx
   <motion.div whileHover={{ scale: 1.05 }}>
   ```

6. **Leverage design tokens**
   ```tsx
   borderRadius: styles.borderRadius.lg
   fontSize: styles.fontSize.xl
   ```
