class ClientMockBuilder {
  private table: string;

  constructor(table: string) {
    this.table = table;
  }

  select() {
    return this;
  }

  eq() {
    return this;
  }

  single() {
    return this;
  }

  async then(onfulfilled?: (value: any) => any) {
    const data = {
      id: "demo-user-id",
      email: "admin@jobbly.com",
      business_name: "Jobbly Demo Contractor",
      business_address: "123 Main St",
      business_city: "Austin",
      business_state: "TX",
      business_zip: "78701",
      business_phone: "512-555-0199",
      business_email: "billing@jobblydemo.com",
      default_tax_rate: 8.25,
      default_payment_terms: "Net 30",
      subscription_plan: "free",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const result = { data, error: null };
    if (onfulfilled) return onfulfilled(result);
    return result;
  }
}

export function createBrowserMockClient() {
  return {
    auth: {
      getUser: async () => {
        return { data: { user: { id: "demo-user-id", email: "admin@jobbly.com" } }, error: null };
      },
      signInWithPassword: async (credentials: any) => {
        document.cookie = "demo_auth=true; path=/;";
        return { data: { user: { id: "demo-user-id", email: credentials.email || "admin@jobbly.com" } }, error: null };
      },
      signUp: async (credentials: any) => {
        document.cookie = "demo_auth=true; path=/;";
        return { data: { user: { id: "demo-user-id", email: credentials.email || "admin@jobbly.com" } }, error: null };
      },
      signOut: async () => {
        document.cookie = "demo_auth=; Max-Age=0; path=/;";
        return { error: null };
      }
    },
    from: (table: string) => {
      return new ClientMockBuilder(table);
    }
  };
}
