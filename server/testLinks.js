// server/testLinks.js
import { validateUrl } from './linkValidator.js';

const testUrls = [
  // Module 1: AI & Frontier Models
  { category: "Reasoning Models", type: "Hugging Face", url: "https://huggingface.co/blog/open-r1" },
  { category: "Reasoning Models", type: "YouTube", url: "https://www.youtube.com/results?search_query=Fireship+DeepSeek+R1" },
  { category: "Reasoning Models", type: "HF Paper", url: "https://huggingface.co/papers/2305.20050" },

  { category: "Model Context Protocol", type: "Docs", url: "https://modelcontextprotocol.io/introduction" },
  { category: "Model Context Protocol", type: "YouTube", url: "https://www.youtube.com/results?search_query=Fireship+Model+Context+Protocol" },
  { category: "Model Context Protocol", type: "GitHub", url: "https://github.com/modelcontextprotocol/specification" },

  { category: "KV Cache & PagedAttention", type: "GitHub", url: "https://github.com/vllm-project/vllm" },
  { category: "KV Cache & PagedAttention", type: "YouTube", url: "https://www.youtube.com/results?search_query=Two+Minute+Papers+PagedAttention+vLLM" },
  { category: "KV Cache & PagedAttention", type: "HF Paper", url: "https://huggingface.co/papers/2309.06180" },

  { category: "Mixture of Experts", type: "Hugging Face", url: "https://huggingface.co/blog/moe" },
  { category: "Mixture of Experts", type: "YouTube", url: "https://www.youtube.com/results?search_query=3Blue1Brown+Transformers+Attention" },
  { category: "Mixture of Experts", type: "Paper", url: "https://arxiv.org/abs/2101.03961" },

  // Module 2: Distributed Systems
  { category: "Vector Databases", type: "Blog", url: "https://www.pinecone.io/learn/series/faiss/hnsw/" },
  { category: "Vector Databases", type: "YouTube", url: "https://www.youtube.com/results?search_query=Fireship+Vector+Databases" },
  { category: "Vector Databases", type: "Paper", url: "https://arxiv.org/abs/1603.09320" },

  { category: "LSM vs B-Tree", type: "GitHub", url: "https://github.com/facebook/rocksdb" },
  { category: "LSM vs B-Tree", type: "YouTube", url: "https://www.youtube.com/results?search_query=ByteByteGo+B-Tree+vs+LSM-Tree" },
  { category: "LSM vs B-Tree", type: "Paper", url: "https://arxiv.org/abs/2309.06180" },

  { category: "Raft Consensus", type: "Interactive", url: "https://raft.github.io/" },
  { category: "Raft Consensus", type: "YouTube", url: "https://www.youtube.com/results?search_query=Fireship+CAP+theorem+Raft" },
  { category: "Raft Consensus", type: "Paper", url: "https://raft.github.io/raft.pdf" },

  // Module 3: Modern Web & Cloud Frameworks
  { category: "React Server Components", type: "RFC", url: "https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md" },
  { category: "React Server Components", type: "YouTube", url: "https://www.youtube.com/results?search_query=Jack+Herrington+React+Server+Components" },
  { category: "React Server Components", type: "GitHub", url: "https://github.com/facebook/react" },

  { category: "WebGPU", type: "MDN", url: "https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API" },
  { category: "WebGPU", type: "YouTube", url: "https://www.youtube.com/results?search_query=Fireship+WebGPU+in+100+seconds" },
  { category: "WebGPU", type: "W3C", url: "https://www.w3.org/TR/webgpu/" },

  { category: "HTTP/3 & QUIC", type: "Blog", url: "https://blog.cloudflare.com/http3-the-past-present-and-future/" },
  { category: "HTTP/3 & QUIC", type: "YouTube", url: "https://www.youtube.com/results?search_query=Computerphile+QUIC+HTTP3" },
  { category: "HTTP/3 & QUIC", type: "RFC", url: "https://datatracker.ietf.org/doc/html/rfc9000" }
];

async function runTestSuite() {
  console.log(`🔍 Testing ${testUrls.length} candidate deeper dive URLs...\n`);
  let passed = 0;
  let failed = 0;

  for (const item of testUrls) {
    const isValid = await validateUrl(item.url);
    if (isValid) {
      passed++;
      console.log(`✅ [${item.category}] [${item.type}] VALID -> ${item.url}`);
    } else {
      failed++;
      console.error(`❌ [${item.category}] [${item.type}] FAILED -> ${item.url}`);
    }
  }

  console.log(`\n===========================================`);
  console.log(`Summary: ${passed}/${testUrls.length} Passed, ${failed} Failed`);
  if (failed === 0) {
    console.log(`🎉 100% OF TESTED LINKS ARE VALID AND OPERATIONAL!`);
  }
}

runTestSuite();
