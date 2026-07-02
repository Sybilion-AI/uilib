import { useState } from 'react';

import { Button } from '#uilib/components/ui/Button';
import { ButtonGroup } from '#uilib/components/ui/ButtonGroup';
import { Checkbox } from '#uilib/components/ui/Checkbox';
import { DropZone } from '#uilib/components/ui/DropZone/DropZone';
import { Input } from '#uilib/components/ui/Input';
import { Label } from '#uilib/components/ui/Label';
import { LabelWithId } from '#uilib/components/ui/LabelWithId';
import { LabeledInput } from '#uilib/components/ui/LabeledInput/LabeledInput';
import { MobileAdaptiveSelector } from '#uilib/components/ui/MobileAdaptiveSelector';
import { NumberControl } from '#uilib/components/ui/NumberControl';
import { PageContentSection } from '#uilib/components/ui/Page';
import { RegionSelector } from '#uilib/components/ui/RegionCoords';
import { Renamer } from '#uilib/components/ui/Renamer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#uilib/components/ui/Select';
import { Slider } from '#uilib/components/ui/Slider';
import { Switch } from '#uilib/components/ui/Switch';
import { TimeRangeControls } from '#uilib/components/ui/TimeRangeControls';
import { ToggleGroup, ToggleGroupItem } from '#uilib/components/ui/ToggleGroup';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../docsHeaderActions';

const FRUIT_OPTIONS = [
  { value: 'apple', label: 'Apple' },
  { value: 'orange', label: 'Orange' },
  { value: 'banana', label: 'Banana' },
] as const;

const ROLE_OPTIONS = [
  { value: 'viewer', label: 'Viewer' },
  { value: 'editor', label: 'Editor' },
  { value: 'admin', label: 'Admin' },
] as const;

const MOBILE_SELECTOR_ITEMS = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
  { value: 'c', label: 'Gamma' },
] as const;

const REGION_COORDS = {
  NYC: { longitude: -74.006, latitude: 40.7128 },
  London: { longitude: -0.1276, latitude: 51.5074 },
} as const;

const SLIDER_WIDTH = 280;
const FIELD_WIDTH = 280;

const stateLabelStyle: React.CSSProperties = {
  marginBottom: '0.5rem',
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--muted-foreground)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const twoColumnStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '1.5rem',
};

const panelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
  padding: 'var(--p-3)',
  borderRadius: 'var(--radius-3)',
};

function DemoSelect({
  disabled = false,
  defaultValue,
  placeholder = 'Pick fruit',
}: {
  disabled?: boolean;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <Select defaultValue={defaultValue}>
      <SelectTrigger disabled={disabled} style={{ width: FIELD_WIDTH }}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {FRUIT_OPTIONS.map(o => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function FormsOverviewPage() {
  const [sliderValue, setSliderValue] = useState([40]);
  const [toggleValue, setToggleValue] = useState('day');
  const [numberValue, setNumberValue] = useState(2);
  const [labeledValue, setLabeledValue] = useState('Sybilion');
  const [period, setPeriod] = useState('week');
  const [composedName, setComposedName] = useState('Alex Morgan');
  const [composedEmail, setComposedEmail] = useState('alex@example.com');
  const [composedRole, setComposedRole] = useState('editor');
  const [composedNotifications, setComposedNotifications] = useState(true);
  const [composedTerms, setComposedTerms] = useState(false);
  const [dropZoneName, setDropZoneName] = useState<string | null>(null);
  const [mobileSelectorValue, setMobileSelectorValue] = useState('a');
  const [regionPick, setRegionPick] = useState<string | null>(null);
  const [renamerValue, setRenamerValue] = useState('Dataset name');
  const [timeRange, setTimeRange] = useState('1y');

  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Overview' }]}
        title="Overview"
        subheader="Composition of form inputs and actions."
        actions={<DocsHeaderActions />}
      />
      <PageContentSection
        style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}
      >
        <section>
          <h3 style={{ marginBottom: '1rem' }}>Text input</h3>
          <div style={twoColumnStyle}>
            <div style={panelStyle}>
              <p style={stateLabelStyle}>Default</p>
              <Input placeholder="Enter text" style={{ width: FIELD_WIDTH }} />
              <Input
                type="textarea"
                placeholder="Enter description"
                rows={3}
                style={{ width: FIELD_WIDTH }}
              />
            </div>
            <div style={panelStyle}>
              <p style={stateLabelStyle}>Disabled</p>
              <Input
                disabled
                placeholder="Enter text"
                style={{ width: FIELD_WIDTH }}
              />
              <Input
                type="textarea"
                disabled
                placeholder="Enter description"
                rows={3}
                style={{ width: FIELD_WIDTH }}
              />
            </div>
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: '1rem' }}>Label</h3>
          <div style={panelStyle}>
            <Label htmlFor="forms-label-demo">Example label</Label>
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: '1rem' }}>LabelWithId</h3>
          <div style={panelStyle}>
            <LabelWithId id={42} label="Analysis label" />
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: '1rem' }}>LabeledInput</h3>
          <div style={twoColumnStyle}>
            <div style={panelStyle}>
              <p style={stateLabelStyle}>Default</p>
              <LabeledInput
                id="forms-labeled-default"
                name="labeled-default"
                label="Account name"
                value={labeledValue}
                onChange={e => setLabeledValue(e.target.value)}
                placeholder="Value"
              />
            </div>
            <div style={panelStyle}>
              <p style={stateLabelStyle}>Disabled</p>
              <LabeledInput
                id="forms-labeled-disabled"
                name="labeled-disabled"
                label="Account name"
                value="Sybilion"
                onChange={() => {}}
                placeholder="Value"
                disabled
              />
            </div>
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: '1rem' }}>Checkbox</h3>
          <div style={twoColumnStyle}>
            <div style={panelStyle}>
              <p style={stateLabelStyle}>Default</p>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Checkbox id="forms-cb-default" defaultChecked />
                <Label htmlFor="forms-cb-default">Accept terms</Label>
              </div>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Checkbox id="forms-cb-unchecked" />
                <Label htmlFor="forms-cb-unchecked">Subscribe to updates</Label>
              </div>
            </div>
            <div style={panelStyle}>
              <p style={stateLabelStyle}>Disabled</p>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Checkbox id="forms-cb-dis-on" checked disabled />
                <Label htmlFor="forms-cb-dis-on">Accept terms</Label>
              </div>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Checkbox id="forms-cb-dis-off" disabled />
                <Label htmlFor="forms-cb-dis-off">Subscribe to updates</Label>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: '1rem' }}>Switch</h3>
          <div style={twoColumnStyle}>
            <div style={panelStyle}>
              <p style={stateLabelStyle}>Default</p>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Switch id="forms-sw-default" defaultChecked />
                <Label htmlFor="forms-sw-default">Enable notifications</Label>
              </div>
            </div>
            <div style={panelStyle}>
              <p style={stateLabelStyle}>Disabled</p>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Switch id="forms-sw-dis-on" checked disabled />
                <Label htmlFor="forms-sw-dis-on">Enable notifications</Label>
              </div>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Switch id="forms-sw-dis-off" disabled />
                <Label htmlFor="forms-sw-dis-off">Enable notifications</Label>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: '1rem' }}>Select</h3>
          <div style={twoColumnStyle}>
            <div style={panelStyle}>
              <p style={stateLabelStyle}>Default</p>
              <DemoSelect defaultValue="apple" />
              <DemoSelect placeholder="Pick fruit" />
            </div>
            <div style={panelStyle}>
              <p style={stateLabelStyle}>Disabled</p>
              <DemoSelect defaultValue="orange" disabled />
            </div>
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: '1rem' }}>Slider</h3>
          <div style={twoColumnStyle}>
            <div style={panelStyle}>
              <p style={stateLabelStyle}>Default</p>
              <Slider
                value={sliderValue}
                onValueChange={setSliderValue}
                max={100}
                step={1}
                style={{ width: SLIDER_WIDTH }}
              />
              <p style={{ fontSize: 14, color: 'var(--muted-foreground)' }}>
                Value: {sliderValue[0]}
              </p>
            </div>
            <div style={panelStyle}>
              <p style={stateLabelStyle}>Disabled</p>
              <Slider
                defaultValue={[60]}
                max={100}
                step={1}
                disabled
                style={{ width: SLIDER_WIDTH }}
              />
            </div>
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: '1rem' }}>ToggleGroup</h3>
          <div style={twoColumnStyle}>
            <div style={panelStyle}>
              <p style={stateLabelStyle}>Default</p>
              <ToggleGroup
                type="single"
                value={toggleValue}
                onValueChange={val => {
                  if (val) setToggleValue(val);
                }}
              >
                <ToggleGroupItem value="day">Day</ToggleGroupItem>
                <ToggleGroupItem value="week">Week</ToggleGroupItem>
                <ToggleGroupItem value="month">Month</ToggleGroupItem>
              </ToggleGroup>
            </div>
            <div style={panelStyle}>
              <p style={stateLabelStyle}>Disabled</p>
              <ToggleGroup type="single" value="week" disabled>
                <ToggleGroupItem value="day">Day</ToggleGroupItem>
                <ToggleGroupItem value="week">Week</ToggleGroupItem>
                <ToggleGroupItem value="month">Month</ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: '1rem' }}>NumberControl</h3>
          <div style={panelStyle}>
            <NumberControl
              value={numberValue}
              onChange={setNumberValue}
              min={0}
              max={10}
              step={1}
            />
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: '1rem' }}>Button</h3>
          <div style={panelStyle}>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.75rem',
                alignItems: 'center',
              }}
            >
              <Button type="button">Primary</Button>
              <Button type="button" variant="secondary">
                Secondary
              </Button>
              <Button type="button" variant="outline">
                Outline
              </Button>
              <Button type="button" variant="ghost">
                Ghost
              </Button>
              <Button type="button" variant="link">
                Link
              </Button>
            </div>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.75rem',
                alignItems: 'center',
              }}
            >
              <Button type="button" disabled>
                Disabled
              </Button>
              <Button type="button" variant="outline" disabled>
                Disabled outline
              </Button>
            </div>
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: '1rem' }}>ButtonGroup</h3>
          <div style={panelStyle}>
            <ButtonGroup>
              {['day', 'week', 'month'].map(item => (
                <Button
                  key={item}
                  type="button"
                  variant={item === period ? 'default' : 'outline'}
                  onClick={() => setPeriod(item)}
                >
                  {item}
                </Button>
              ))}
            </ButtonGroup>
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: '1rem' }}>DropZone</h3>
          <div style={{ ...panelStyle, maxWidth: 420 }}>
            <DropZone
              accept=".csv,.txt"
              label="Drop a .csv or .txt file here"
              onFile={file => setDropZoneName(file.name)}
            />
            {dropZoneName ? (
              <p style={{ margin: 0, fontSize: 14 }}>
                Selected: {dropZoneName}
              </p>
            ) : null}
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: '1rem' }}>MobileAdaptiveSelector</h3>
          <div style={panelStyle}>
            <MobileAdaptiveSelector
              value={mobileSelectorValue}
              onChange={setMobileSelectorValue}
              items={[...MOBILE_SELECTOR_ITEMS]}
              isDropdown={false}
            />
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: '1rem' }}>RegionCoords</h3>
          <div style={panelStyle}>
            <RegionSelector
              regions={REGION_COORDS}
              onSelect={(name, coords) => {
                setRegionPick(
                  `${name}: ${coords.latitude.toFixed(2)}, ${coords.longitude.toFixed(2)}`,
                );
              }}
            >
              <span style={{ marginRight: 8 }}>Map region</span>
            </RegionSelector>
            {regionPick ? (
              <p style={{ margin: 0, fontSize: 14 }}>{regionPick}</p>
            ) : null}
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: '1rem' }}>Renamer</h3>
          <div style={panelStyle}>
            <Renamer value={renamerValue} onChange={setRenamerValue} size="md">
              {renamerValue}
            </Renamer>
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: '1rem' }}>TimeRangeControls</h3>
          <div style={panelStyle}>
            <TimeRangeControls
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
              loading={false}
            />
          </div>
        </section>

        {/* Form (react-hook-form integration) excluded — see FormPage */}

        <section>
          <h3 style={{ marginBottom: '1rem' }}>Composed form</h3>
          <p
            style={{
              marginBottom: '1rem',
              color: 'var(--muted-foreground)',
              maxWidth: 560,
            }}
          >
            Realistic layout combining several controls — visual composition
            only, no form library.
          </p>
          <form
            style={{
              ...panelStyle,
              maxWidth: 480,
              gap: '1.25rem',
            }}
            onSubmit={e => e.preventDefault()}
          >
            <LabeledInput
              id="forms-composed-name"
              name="name"
              label="Full name"
              value={composedName}
              onChange={e => setComposedName(e.target.value)}
              placeholder="Enter your name"
            />
            <LabeledInput
              id="forms-composed-email"
              name="email"
              type="email"
              label="Email"
              value={composedEmail}
              onChange={e => setComposedEmail(e.target.value)}
              placeholder="you@company.com"
            />
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <Label htmlFor="forms-composed-role">Role</Label>
              <Select value={composedRole} onValueChange={setComposedRole}>
                <SelectTrigger
                  id="forms-composed-role"
                  style={{ width: '100%' }}
                >
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Switch
                id="forms-composed-notifications"
                checked={composedNotifications}
                onCheckedChange={setComposedNotifications}
              />
              <Label htmlFor="forms-composed-notifications">
                Email me about product updates
              </Label>
            </div>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Checkbox
                id="forms-composed-terms"
                checked={composedTerms}
                onCheckedChange={v => setComposedTerms(v === true)}
              />
              <Label htmlFor="forms-composed-terms">
                I agree to the terms of service
              </Label>
            </div>
            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                paddingTop: '0.5rem',
              }}
            >
              <Button type="submit">Save profile</Button>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </div>
          </form>
        </section>
      </PageContentSection>
    </>
  );
}
