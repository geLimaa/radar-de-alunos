export function engagementBand(value: number | null): string {
  if(value == null){
    return "never";
  }
  else if(value >= 0 && value <= 14){
    return "engaged";
  }
  else if(value >= 15 && value <= 30){
    return "sliping";
  }
  else{
    return "disengaged";
  }
}