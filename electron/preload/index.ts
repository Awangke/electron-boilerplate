import { ipcRenderer, contextBridge } from "electron";
const showMsgBox = (args: any) => {
  ipcRenderer.invoke("on-show-msg-box", args);
};
const save = (args: any) => {
  ipcRenderer.invoke("on-save", args);
};
contextBridge.exposeInMainWorld("electronApi", {
  save,
  showMsgBox,
});
