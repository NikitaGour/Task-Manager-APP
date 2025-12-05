//custome hook for  getting the task, themes data from localstorage and set new tasks also when the page loads
import React from "react";

export function useLocalStorage(key, fallback) {
const [value, setValue] = React.useState(() => {
try {
const saved = localStorage.getItem(key);
return saved ? JSON.parse(saved) : fallback;
} catch {
return fallback;
}
});


React.useEffect(() => {
localStorage.setItem(key, JSON.stringify(value)); 
}, [key, value]);


return [value, setValue];
}