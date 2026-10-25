import {MEDIA_TYPES} from '../config/media.js';
const messageFields=['id','role','kind','text','createdAt','topic','tone','sourceLibrary','tier','expressionIds','familyIds','parts','irritation','continuation','contextUsed','contextTopic','pendingRequestTopic','situation','completedTopics','gender','candidateTopic','topicFallback','requestedTopic','length','libraryFallback','toneFallback'];
// A privacy boundary: attachment episodes and unknown resource fields never reach JSON storage.
export function persistentState(state) {
  return {schemaVersion:state.schemaVersion,nextChatNumber:state.nextChatNumber,selectedChatId:state.selectedChatId,
    chats:state.chats.map(chat=>{
      const transient=new Set(chat.messages.filter(m=>m.temporary || m.attachment || m.kind==='attachment' || MEDIA_TYPES.includes(m.kind)).map(m=>m.episodeId).filter(Boolean));
      const messages=chat.messages.filter(m=>!m.temporary && !m.episodeId && !m.attachment && m.kind!=='attachment' && !MEDIA_TYPES.includes(m.kind) && !transient.has(m.episodeId))
        .map(message=>Object.fromEntries(messageFields.filter(key=>message[key]!==undefined).map(key=>[key,message[key]])));
      return {id:chat.id,number:chat.number,title:chat.title,createdAt:chat.createdAt,updatedAt:chat.updatedAt,backgroundId:chat.backgroundId,messages};
    })};
}
