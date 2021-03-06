class Stats {
  constructor(content) {
    this.region = content.Region;
    this.season = content.Season;
    this.match = content.Match;
    this.stats = this._stats(content);
  }

  _stats(content) {
    const stats = [];
    for (const stat of Object.keys(content.Stats)) {
      const key = content.Stats[stat];
      const obj = {
        name: key.label,
        fullName: key.field,
        category: key.category,
        value: key.value,
        rank: key.rank,
        percentile: key.percentile
      };
      stats.push(obj);
    }
    return stats;
  }
}

module.exports = Stats;
