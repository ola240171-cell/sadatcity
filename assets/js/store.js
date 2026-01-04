/**
 * Store System (Cloud Version)
 * Syncs with Supabase
 */

class Store {
    constructor() {
        this.data = {
            properties: [],
            clients: []
        };
        this.init();
    }

    async init() {
        await this.fetchProperties();
        await this.fetchClients();
        // Refresh UI if app is ready
        if (window.app) {
            window.app.renderDashboard();
        }
    }

    // --- Properties ---

    async fetchProperties() {
        const { data, error } = await window.supabaseClient
            .from('properties')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching properties:', error);
            return;
        }
        this.data.properties = data || [];
        if (window.app && window.app.currentView === 'properties') window.app.renderProperties();
    }

    async addProperty(property) {
        // Optimistic Update
        this.data.properties.unshift(property);
        if (window.app && window.app.currentView === 'properties') window.app.renderProperties();

        const { error } = await window.supabaseClient
            .from('properties')
            .insert([{
                title: property.title,
                price: property.price,
                area: property.area,
                location: property.location,
                type: property.type,
                status: property.status,
                date_added: new Date().toISOString().split('T')[0]
            }]);

        if (error) {
            alert('فشل حفظ العقار في السحابة!');
            console.error(error);
        } else {
            // Re-fetch to get ID/Timestamp
            this.fetchProperties();
        }
    }

    getProperties() {
        return this.data.properties;
    }

    // --- Clients ---

    async fetchClients() {
        const { data, error } = await window.supabaseClient
            .from('clients')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching clients:', error);
            return;
        }
        this.data.clients = data || [];
        if (window.app && window.app.currentView === 'clients') window.app.renderClients();
    }

    async addClient(client) {
        // Optimistic Update
        this.data.clients.unshift(client);
        if (window.app && window.app.currentView === 'clients') window.app.renderClients();

        const { error } = await window.supabaseClient
            .from('clients')
            .insert([{
                name: client.name,
                phone: client.phone,
                budget: client.budget,
                interest: client.interest,
                status: client.status
            }]);

        if (error) {
            alert('فشل حفظ العميل!');
            console.error(error);
        } else {
            this.fetchClients();
        }
    }

    getClients() {
        return this.data.clients;
    }

    // --- Stats ---

    getStats() {
        const props = this.data.properties;
        const totalValue = props.filter(p => p.type === 'sale').reduce((acc, curr) => acc + (curr.price || 0), 0);
        return {
            totalProperties: props.length,
            available: props.filter(p => p.status === 'available').length,
            clients: this.data.clients.length,
            totalValue: totalValue
        };
    }
}

// Global Instance
window.store = new Store();
