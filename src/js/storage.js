export class StorageManager {
  constructor() {
    this.storageKey = 'wanderlust_plans';
  }

  savePlan(plan) {
    const plans = this.getPlans();
    plans.push(plan);
    localStorage.setItem(this.storageKey, JSON.stringify(plans));
  }

  getPlans() {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  deletePlan(id) {
    let plans = this.getPlans();
    plans = plans.filter(p => p.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(plans));
  }
}
