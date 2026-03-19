type TreeNode = {
  value: string
  label: string
  children?: TreeNode[]
  [key: string]: any
}
export function buildTree(
  data: any[],
  rootParentId: string | number = 0,
  fieldMap = { id: 'value', contentsName: 'label' },
): TreeNode[] {
  const map = new Map<string | number, TreeNode>()

  data.forEach((item) => {
    const node: TreeNode = {
      ...Object.fromEntries(
        Object.entries(fieldMap).map(([from, to]) => [to, (item as any)[from]]),
      ),
      children: [],
      ...item,  
    }
    map.set(item.id, node)
  })

  const tree: TreeNode[] = []

  data.forEach((item) => {
    const node = map.get(item.id)!
    if (item.parentId == rootParentId || item.parentId === 0) {
      tree.push(node)
    } else {
      const parent = map.get(item.parentId)
      if (parent) {
        parent.children = parent.children || []
        parent.children.push(node)
      }
    }
  })

  function sortTree(nodes: TreeNode[]) {
    nodes.sort((a, b) => (a.contentOrder ?? 0) - (b.contentOrder ?? 0))
    nodes.forEach((n) => {
      if (n.children && n.children.length > 0) {
        sortTree(n.children)
      }
    })
  }

  sortTree(tree)

  return tree
}
