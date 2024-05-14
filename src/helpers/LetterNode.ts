export class LetterNode {
    public value: string;

    private connections = new Map<string, [node: LetterNode, strength: number]>();

    constructor(value: string) {
        this.value = value;
    }

    public total(exclude: Set<string>) {
        let total = 0;
        this.connections.forEach((con) => {
            total += exclude.has(con[0].value) ? 0.01 : con[1];
        });
        return total;
    }

    public connectionStrength(value: string) {
        return this.connections.get(value)?.[1] || 0;
    }

    public addConnection(node: LetterNode) {
        let connection = this.connections.get(node.value);

        if (!connection) {
            connection = [node, 0];

            this.connections.set(node.value, connection);
        }

        connection[1]++;
    }
}