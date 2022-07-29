import { useState } from "react";
import { NFTStorage, File } from "nft.storage";

import "../styles/create-item.css";



const nftStorage = new NFTStorage({              //1(iii).
  token: process.env.REACT_APP_NFT_STORAGE_KEY, 
});

const store = async (name, description, data, fileName, type) => { //1(ii). 
  const metadata = await nftStorage.store({
    name,
    description,
    image: new File([data], fileName, { type }),
  });
  console.log(metadata);
  return metadata;
};




const Create = ({ bunzz, userAddress }) => {
  //THESE ARE THE VARIOUS STATES OF THIS COMPONENT
  const [blob, setBlob] = useState(null);
  const [fileName, setFileName] = useState(null);            //
  const [base64, setBase64] = useState(null);           //
  const [onGoing, setOnGoing] = useState(false);
  const [tokenId, setTokenId] = useState(null);
  const [type, setType] = useState(null);       //
  const [name, setName] = useState("");      //
  const [description, setDescription] = useState(""); //

  const select = (e) => {   // I also understand these
    const file = e.target.files[0];
    console.log(file);

    if (file) {
      readAsBlob(file);
      readAsBase64(file);
      setType(file.type);
      setFileName(file.name);
    }
  };

  const readAsBlob = (file) => { //
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = () => {
      console.log(reader.result);
      setBlob(reader.result);
    };
  };

  const readAsBase64 = (file) => {  // to read the image file as base 64(a file reader)
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      console.log(reader.result); //returns the result of the filereader
      setBase64(reader.result);
    };
  };

  const submit = async () => { // I understood here well, This is the onClick even handler for line 109(submit ) function
    setOnGoing(true);    //it set the onGoing to true.   //onGoing is a state to show that data from the input field is being submitted(or is submitting. i.e it is trying to store the data from the input field in the nftStorage(IPFS) object)
    try {
      const metadata = await store(name, description, blob, fileName, type); // 1i. 
      const contract = await bunzz.getContract("NFT (IPFS Mintable)");           //2.              // This is where you apply those interactions code from Bunzz Docs
      const inputUrl = metadata.url.replace(/^ipfs:\/\//, "");  //3

      const tx = await contract.safeMint(userAddress, inputUrl); //4
      const receipt = await tx.wait();                                        //gets transaction logs/ Details
      console.log(receipt);             //5 end of minting (interaction with the blockchain............... Back to the app)

      const event = receipt.events[0];   //   // This generates the event (from the array it indexes the first item)that happened in the transaction
      const _tokenId = event.args[2];       //it indexes the second item and assigns it/store in the variable (_tokenId)
      setTokenId(_tokenId);
      setBase64(null);
      window.alert("Succeeded to mint");
    } catch (err) {
      console.error(err);
    } finally {
      setOnGoing(false);
    }
  };

  return (
    <div className="wrapper">
      <p className="title">
        Step1: Mint your NFT with IPFS
      </p>
      <input
        className="form__input w-50"
        placeholder="Token Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        type="text"
      />
      <input
        className="form__input w-50"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        type="text"
      />
      <input type="file" accept="image/*" onChange={select} />        {/**Inside the input field the onChange EVENT HANDLER calls the select function  */}
      {base64 ? (
          <img src={base64} alt="hoge" className="image" />
      ) : (
        <></>
      )}
      {onGoing ? (       // another way of writing an if statement. It basically says if onGoing(Its a state) is True, render a div that with text (Loading...)
        <div className="center">
          Loading...
        </div>
      ) : (
        <button onClick={submit}>
          mint
        </button>
      )}
      {tokenId ? <p>token ID: {tokenId}</p> : <></>}
    </div>
  );
};


export default Create;