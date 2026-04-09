import { jsxs, jsx } from 'react/jsx-runtime';
import { useSearchParams, Link } from 'react-router-dom';
import { buildDatasetApplicationPath } from '../../../../utils/datasetApplicationLink.js';
import { LayoutDashboard } from 'lucide-react';
import S from './ChatMessage.styl.js';

function ChatDatasetApplicationLink({ datasetId, analysisId, label = 'Open application', }) {
    const url = buildDatasetApplicationPath(datasetId, analysisId);
    const [searchParams, setSearchParams] = useSearchParams();
    const handleClick = (e) => {
        if (location.pathname !== '/datasets')
            return;
        e.preventDefault();
        const params = new URLSearchParams(searchParams);
        params.set('id', datasetId.toString());
        if (analysisId)
            params.set('analysisId', analysisId.toString());
        setSearchParams(params);
    };
    return (jsxs(Link, { className: S.datasetAppLink, to: url, onClickCapture: handleClick, children: [jsx(LayoutDashboard, { size: 16, "aria-hidden": true }), jsx("span", { className: S.datasetAppLinkLabel, children: label })] }));
}

export { ChatDatasetApplicationLink };
