exports.isDifferInArrays = (arr1 = [], arr2 = []) => {
    if(arr1 === arr2 || (arr1?.length < 1 && arr2?.length < 1)) return false
    
    if (arr1?.length !== arr2?.length) return true; // Length mismatch means a change

    return arr1?.some((value, index) => value !== arr2[index]); // Check if any element differs
}