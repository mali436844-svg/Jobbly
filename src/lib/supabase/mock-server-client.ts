import { getMockData, insertMockData, updateMockData, deleteMockData } from './mock-db'

class ServerMockBuilder {
  private table: string;
  private filters: any[] = [];
  private orderField: string | null = null;
  private orderAsc: boolean = true;
  private limitCount: number | null = null;
  private isSingle: boolean = false;
  
  private mutationType: 'select' | 'insert' | 'update' | 'delete' = 'select';
  private mutationData: any = null;

  constructor(table: string) {
    this.table = table;
  }

  select(_columns?: string) {
    void _columns;
    return this;
  }

  insert(data: any) {
    this.mutationType = 'insert';
    this.mutationData = data;
    return this;
  }

  update(data: any) {
    this.mutationType = 'update';
    this.mutationData = data;
    return this;
  }

  delete() {
    this.mutationType = 'delete';
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push({ type: 'eq', column, value });
    return this;
  }

  neq(column: string, value: any) {
    this.filters.push({ type: 'neq', column, value });
    return this;
  }

  gte(column: string, value: any) {
    this.filters.push({ type: 'gte', column, value });
    return this;
  }

  lte(column: string, value: any) {
    this.filters.push({ type: 'lte', column, value });
    return this;
  }

  gt(column: string, value: any) {
    this.filters.push({ type: 'gt', column, value });
    return this;
  }

  lt(column: string, value: any) {
    this.filters.push({ type: 'lt', column, value });
    return this;
  }

  in(column: string, values: any[]) {
    this.filters.push({ type: 'in', column, value: values });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderField = column;
    this.orderAsc = options?.ascending ?? true;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  maybeSingle() {
    this.isSingle = true;
    return this;
  }

  async then(onfulfilled?: (value: any) => any) {
    try {
      let data: any;
      if (this.mutationType === 'insert') {
        data = await insertMockData(this.table, this.mutationData);
      } else if (this.mutationType === 'update') {
        data = await updateMockData(this.table, this.filters, this.mutationData);
      } else if (this.mutationType === 'delete') {
        data = await deleteMockData(this.table, this.filters);
      } else {
        data = await getMockData(this.table, this.filters, this.orderField, this.orderAsc, this.limitCount);
      }

      if (this.isSingle) {
        data = Array.isArray(data) ? (data[0] || null) : data;
      }

      let count = 0;
      if (Array.isArray(data)) {
        count = data.length;
      } else if (data !== null && data !== undefined) {
        count = 1;
      }

      const result = { data, error: null, count };
      if (onfulfilled) return onfulfilled(result);
      return result;
    } catch (err: any) {
      const errorResult = { data: null, error: { message: err.message }, count: 0 };
      if (onfulfilled) return onfulfilled(errorResult);
      return errorResult;
    }
  }
}

export function createServerMockClient() {
  return {
    auth: {
      getUser: async () => {
        return { data: { user: { id: "demo-user-id", email: "admin@jobbly.com" } }, error: null };
      },
      signInWithPassword: async () => {
        return { data: { user: { id: "demo-user-id", email: "admin@jobbly.com" } }, error: null };
      },
      signUp: async () => {
        return { data: { user: { id: "demo-user-id", email: "admin@jobbly.com" } }, error: null };
      },
      signOut: async () => {
        return { error: null };
      }
    },
    from: (table: string) => {
      return new ServerMockBuilder(table);
    }
  };
}
