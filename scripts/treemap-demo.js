document.addEventListener('DOMContentLoaded', () => {
    const stage = document.getElementById('treemap-demo');
    if (!stage) return;

    const status = document.getElementById('treemap-status');
    const original = [
        { name: 'src', colour: '#315c47', children: [
            { name: 'tree_model.py', size: 40, colour: '#397a5a' },
            { name: 'paper_model.py', size: 30, colour: '#4b8f6c' },
            { name: 'visualizer.py', size: 50, colour: '#287052' }
        ]},
        { name: 'data', colour: '#614b87', children: [
            { name: 'research_papers.csv', size: 30, colour: '#765ba0' },
            { name: 'sample_papers.csv', size: 20, colour: '#9478bd' }
        ]},
        { name: 'tests', colour: '#8b5838', children: [
            { name: 'test_trees.py', size: 25, colour: '#a86c45' },
            { name: 'test_papers.py', size: 25, colour: '#c17c4e' }
        ]}
    ];
    let data = structuredClone(original);
    let expanded = true;
    let selected = null;

    const total = nodes => nodes.reduce((sum, node) =>
        sum + (node.children ? total(node.children) : node.size), 0);

    function leaves(nodes, prefix = '') {
        const result = [];
        nodes.forEach(node => {
            const path = prefix ? `${prefix}/${node.name}` : node.name;
            if (expanded && node.children) {
                result.push(...leaves(node.children, path));
            } else {
                result.push({...node, path, size: node.children ? total(node.children) : node.size});
            }
        });
        return result;
    }

    function partition(items, box, vertical, output) {
        const sum = items.reduce((n, item) => n + item.size, 0);
        let cursor = vertical ? box.x : box.y;
        items.forEach((item, index) => {
            const last = index === items.length - 1;
            const share = item.size / sum;
            if (vertical) {
                const width = last ? box.x + box.w - cursor : box.w * share;
                output.push({item, x: cursor, y: box.y, w: width, h: box.h});
                cursor += width;
            } else {
                const height = last ? box.y + box.h - cursor : box.h * share;
                output.push({item, x: box.x, y: cursor, w: box.w, h: height});
                cursor += height;
            }
        });
    }

    function render() {
        stage.replaceChildren();
        const items = leaves(data);
        const rects = [];
        partition(items, {x: 0, y: 0, w: 100, h: 100}, stage.clientWidth >= stage.clientHeight, rects);
        rects.forEach(rect => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `treemap-cell${selected === rect.item.path ? ' selected' : ''}`;
            button.style.cssText = `left:${rect.x}%;top:${rect.y}%;width:${rect.w}%;height:${rect.h}%;background:${rect.item.colour}`;
            button.innerHTML = `<span>${rect.item.path}<br>${rect.item.size} KB</span>`;
            button.addEventListener('click', () => {
                selected = rect.item.path;
                status.textContent = `${rect.item.path} — ${rect.item.size} KB`;
                render();
            });
            stage.appendChild(button);
        });
    }

    document.querySelectorAll('[data-demo-action]').forEach(button => {
        button.addEventListener('click', () => {
            const action = button.dataset.demoAction;
            if (action === 'expand') expanded = true;
            if (action === 'collapse') expanded = false;
            if (action === 'reset') {
                data = structuredClone(original);
                expanded = true;
                selected = null;
                status.textContent = 'Click a rectangle to select it.';
            }
            if ((action === 'grow' || action === 'shrink') && selected) {
                const visit = (nodes, prefix = '') => nodes.forEach(node => {
                    const path = prefix ? `${prefix}/${node.name}` : node.name;
                    if (node.children) visit(node.children, path);
                    else if (path === selected) node.size = Math.max(1, node.size + (action === 'grow' ? 5 : -5));
                });
                visit(data);
            }
            render();
        });
    });

    window.addEventListener('resize', render);
    render();
});
