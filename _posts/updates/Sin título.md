.button {

    --green: #ffffff;

    font-size: 15px;

    padding: 0.7em 2.7em;

    letter-spacing: 0.06em;

    position: relative;

    font-family: "Exo 2", serif;

    font-optical-sizing: auto;

    font-style: italic;

    width: 100%;

    font-weight: 700;

    border-radius: 0.6em;

    margin-bottom: 10px;

    overflow: hidden;

    transition: all 0.3s;

    line-height: 1.4em;

    border: 2px solid var(--green);

    background: linear-gradient(to right, rgba(27, 253, 156, 0.1) 1%, transparent 40%,transparent 60% , rgba(27, 253, 156, 0.1) 100%);

    color: var(--green);

    box-shadow: inset 0 0 10px rgba(27, 42, 253, 0.4), 0 0 9px 3px rgba(27, 253, 156, 0.1);

  }

  .button:hover {

    color: #ffffff;

    box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.6), 0 0 9px 3px rgba(27, 253, 156, 0.2);

  }

  .button:before {

    content: "";

    position: absolute;

    left: -4em;

    width: 4em;

    height: 100%;

    top: 0;

    transition: transform .4s ease-in-out;

    background: linear-gradient(to right, transparent 1%, rgba(27, 253, 156, 0.1) 40%,rgba(27, 253, 156, 0.1) 60% , transparent 100%);

  }

  .button:hover:before {

    transform: translateX(15em);

  }