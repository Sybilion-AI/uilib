import { jsx, Fragment } from 'react/jsx-runtime';
import { ReferenceDot, Label } from 'recharts';

function TrendAnnotations({ annotations }) {
    return (jsx(Fragment, { children: annotations.map((annotation, index) => (jsx(ReferenceDot, { x: annotation.x, y: annotation.y, r: 0, fill: "transparent", stroke: "transparent", children: jsx(Label, { value: annotation.text, position: "right", fill: annotation.color, fontSize: 12, fontWeight: "bold", offset: 10 }) }, `annotation-${index}`))) }));
}

export { TrendAnnotations };
