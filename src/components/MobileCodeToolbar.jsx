import React, { memo, useCallback } from 'react';
import { Undo2, Redo2 } from 'lucide-react';

// ── Expansion maps (Emmet-like) ──────────────────────────────────────────────

const HTML_EXPANSIONS = {
    div: '<div></div>', p: '<p></p>', span: '<span></span>',
    h1: '<h1></h1>', h2: '<h2></h2>', h3: '<h3></h3>',
    h4: '<h4></h4>', h5: '<h5></h5>', h6: '<h6></h6>',
    a: '<a href=""></a>', img: '<img src="" alt="">',
    input: '<input type="text" placeholder="">',
    button: '<button></button>',
    ul: '<ul>\n  <li></li>\n</ul>', ol: '<ol>\n  <li></li>\n</ol>',
    li: '<li></li>', form: '<form action="" method="post">\n  \n</form>',
    section: '<section></section>', article: '<article></article>',
    header: '<header></header>', footer: '<footer></footer>',
    nav: '<nav></nav>', main: '<main></main>',
    table: '<table>\n  <tr>\n    <td></td>\n  </tr>\n</table>',
    tr: '<tr></tr>', td: '<td></td>', th: '<th></th>',
    label: '<label></label>', select: '<select></select>',
    textarea: '<textarea></textarea>',
    script: '<script>\n  \n</script>', style: '<style>\n  \n</style>',
    link: '<link rel="stylesheet" href="">',
    meta: '<meta name="" content="">',
};

const CSS_EXPANSIONS = {
    color: 'color: ;', bg: 'background: ;', bgc: 'background-color: ;',
    bgi: 'background-image: url();',
    m: 'margin: ;', mt: 'margin-top: ;', mb: 'margin-bottom: ;',
    ml: 'margin-left: ;', mr: 'margin-right: ;',
    p: 'padding: ;', pt: 'padding-top: ;', pb: 'padding-bottom: ;',
    w: 'width: ;', h: 'height: ;', mw: 'max-width: ;', mh: 'max-height: ;',
    d: 'display: ;', flex: 'display: flex;', grid: 'display: grid;',
    pos: 'position: ;', abs: 'position: absolute;', rel: 'position: relative;',
    fs: 'font-size: ;', fw: 'font-weight: ;', ff: 'font-family: ;',
    ta: 'text-align: ;', br: 'border-radius: ;', bo: 'border: ;',
    op: 'opacity: ;', z: 'z-index: ;',
    tr: 'transition: all 0.3s ease;',
    sha: 'box-shadow: 0 2px 8px rgba(0,0,0,0.2);',
};

const JS_EXPANSIONS = {
    fn: 'function name() {\n  \n}', af: 'const name = () => {\n  \n};',
    if: 'if () {\n  \n}', el: 'else {\n  \n}', ei: 'else if () {\n  \n}',
    for: 'for (let i = 0; i < arr.length; i++) {\n  \n}',
    fof: 'for (const item of arr) {\n  \n}', wh: 'while () {\n  \n}',
    cl: 'console.log();', ce: 'console.error();',
    const: 'const name = ;', let: 'let name = ;',
    imp: "import  from '';", exp: 'export default ',
    class: 'class Name {\n  constructor() {\n    \n  }\n}',
    try: 'try {\n  \n} catch (e) {\n  console.error(e);\n}',
    ret: 'return ;', doc: 'document.querySelector()',
    ael: "document.addEventListener('', () => {\n  \n});",
    fet: "fetch('').then(r => r.json()).then(data => {\n  console.log(data);\n});",
};

const HTML_BOILERPLATE =
    '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Document</title>\n</head>\n<body>\n  \n</body>\n</html>';

// ── Per-language button definitions ─────────────────────────────────────────

function getButtons(language) {
    if (language === 'html') {
        return [
            { label: '!',       value: HTML_BOILERPLATE, accent: true  },
            { label: '<div>',   value: '<div></div>',    cursorBack: 6  },
            { label: '<p>',     value: '<p></p>',        cursorBack: 4  },
            { label: '<h1>',    value: '<h1></h1>',      cursorBack: 5  },
            { label: '<span>',  value: '<span></span>',  cursorBack: 7  },
            { label: '<a>',     value: '<a href=""></a>', cursorBack: 4 },
            { label: '<img>',   value: '<img src="" alt="">'            },
            { label: '<input>', value: '<input type="text" placeholder="">' },
            { label: '<ul>',    value: '<ul>\n  <li></li>\n</ul>',      },
            { label: '<form>',  value: '<form action="" method="post">\n  \n</form>' },
            { label: '<btn>',   value: '<button></button>', cursorBack: 9 },
            { label: '<link>',  value: '<link rel="stylesheet" href="">' },
            { label: '<script>',value: '<script>\n  \n</script>'        },
        ];
    }
    if (language === 'css') {
        return [
            { label: '{ }',  value: ' {\n  \n}' },
            { label: ':',    value: ': '         },
            { label: ';',    value: ';'          },
            { label: '#',    value: '#'          },
            { label: '.cls', value: '.classname {\n  \n}' },
            { label: 'px',   value: 'px'         },
            { label: '%',    value: '%'           },
            { label: 'rem',  value: 'rem'         },
            { label: 'flex', value: 'display: flex;\n  align-items: center;\n  justify-content: center;', accent: true },
            { label: 'grid', value: 'display: grid;', accent: true },
            { label: 'abs',  value: 'position: absolute;' },
            { label: 'rel',  value: 'position: relative;' },
            { label: 'var(', value: 'var(--)'    },
        ];
    }
    // javascript / typescript / python / default
    return [
        { label: 'fn',   value: 'function name() {\n  \n}', accent: true },
        { label: 'if',   value: 'if () {\n  \n}'            },
        { label: 'cl>',  value: 'console.log();'            },
        { label: '( )',  value: '()',  cursorBack: 1         },
        { label: '{ }',  value: '{\n  \n}'                  },
        { label: '[ ]',  value: '[]', cursorBack: 1         },
        { label: '=>',   value: ' => '                       },
        { label: ';',    value: ';'                          },
        { label: 'try',  value: 'try {\n  \n} catch (e) {\n  console.error(e);\n}' },
        { label: 'for',  value: 'for (let i = 0; i < arr.length; i++) {\n  \n}' },
        { label: 'imp',  value: "import  from '';", accent: true },
        { label: 'ret',  value: 'return '                   },
        { label: '?',    value: '?'                         },
    ];
}

// ── Component ────────────────────────────────────────────────────────────────

const MobileCodeToolbar = memo(({ onInsert, onUndo, onRedo, canUndo, canRedo, language = 'javascript' }) => {
    const buttons = getButtons(language);

    const handleInsert = useCallback((btn) => {
        if (btn.cursorBack) {
            onInsert(btn.value, btn.value.length - btn.cursorBack);
        } else {
            onInsert(btn.value, btn.value.length);
        }
    }, [onInsert]);

    const handleTabExpand = useCallback(() => {
        onInsert('\t', 1);
    }, [onInsert]);

    const btnStyle = (accent, disabled) => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '32px',
        padding: '0 12px',
        borderRadius: '6px',
        border: `1px solid ${accent ? 'var(--color-teal)' : 'rgba(148,163,184,0.1)'}`,
        backgroundColor: accent ? 'rgba(6,182,212,0.15)' : 'var(--bg-panel)',
        color: disabled ? 'rgba(148,163,184,0.25)' : (accent ? 'var(--color-teal)' : 'var(--color-text)'),
        fontFamily: 'var(--font-code)',
        fontSize: '13px',
        fontWeight: accent ? 700 : 400,
        cursor: disabled ? 'default' : 'pointer',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        transition: 'opacity 0.15s',
        userSelect: 'none',
        WebkitUserSelect: 'none',
    });

    return (
        <div
            className="md:hidden flex-shrink-0"
            style={{
                height: '44px',
                backgroundColor: 'var(--bg-header)',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                overflowX: 'auto',
                overflowY: 'hidden',
                gap: '6px',
                padding: '0 8px',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
            }}
        >
            {/* Undo */}
            <button
                style={btnStyle(false, !canUndo)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={onUndo}
                disabled={!canUndo}
            >
                <Undo2 size={15} />
            </button>

            {/* Redo */}
            <button
                style={btnStyle(false, !canRedo)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={onRedo}
                disabled={!canRedo}
            >
                <Redo2 size={15} />
            </button>

            {/* Tab Expand */}
            <button
                style={{ ...btnStyle(true, false), padding: '0 10px' }}
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleTabExpand}
                title="Tab / Expand"
            >
                ⇥
            </button>

            {/* Divider */}
            <div style={{ width: 1, height: 22, backgroundColor: 'var(--border-color)', flexShrink: 0 }} />

            {/* Context buttons */}
            {buttons.map((btn, i) => (
                <button
                    key={i}
                    style={btnStyle(btn.accent, false)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleInsert(btn)}
                >
                    {btn.label}
                </button>
            ))}
        </div>
    );
});

MobileCodeToolbar.displayName = 'MobileCodeToolbar';

export { HTML_EXPANSIONS, CSS_EXPANSIONS, JS_EXPANSIONS };
export default MobileCodeToolbar;
