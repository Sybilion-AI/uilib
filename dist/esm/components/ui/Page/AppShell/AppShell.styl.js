import styleInject from 'style-inject';

var css_248z = "@media (max-width:768px){:root{--page-x-padding:var(--p-6);--page-y-padding:var(--p-6)}}.AppShell_root__ONlNK{display:grid;flex:1;grid-template-areas:\"main\";grid-template-columns:1fr;min-height:0;width:100%}@media (min-width:768px){.AppShell_root__ONlNK{grid-template-areas:\"sidebar main\";grid-template-columns:var(--sidebar-width) 1fr}[data-slot=sidebar-wrapper][data-state=collapsed] .AppShell_root__ONlNK{grid-template-columns:0 1fr}}.AppShell_mainColumn__Emn1p{display:flex;flex:1;flex-direction:column;grid-area:main;min-height:0;min-width:0}[data-slot=sidebar-wrapper][data-state=collapsed] .AppShell_mainColumn__Emn1p{margin-left:var(--p-3)}.AppShell_mainBody__IoVuy{background-color:var(--page-color);border-radius:var(--p-4);flex:1;min-width:0;padding-bottom:var(--page-y-padding)}";
var S = {"root":"AppShell_root__ONlNK","mainColumn":"AppShell_mainColumn__Emn1p","mainBody":"AppShell_mainBody__IoVuy"};
styleInject(css_248z);

export { S as default };
