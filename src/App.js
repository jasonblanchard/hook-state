import React, {
  Component,
  createContext,
  useContext,
  useReducer,
  useMemo,
  useEffect,
  useState
} from 'react';
import './App.css';
import styled from 'styled-components'

const AppContext = createContext();

const AppProvider = ({ children }) => {
  const initialState = {
    letters: 'a',
    content: '',
    symbol: '🍕'
  }
  const reducer = (state = {}, action) => {
    // console.log(action); 

    switch (action.type) {
      case 'CHANGE_CONTENT':
        return {
          ...state,
          ...{ content: action.value }
        };

      case 'CHANGE_LETTERS':
        return {
          ...state,
          ...{ letters: action.value }
        };

      case 'CHANGE_SYMBOL':
        return {
          ...state,
          ...{ symbol: action.value }
        };

      default:
        return state;
    }
  }

  const effector = (action = {}, state) => {
    switch (action.type) {
      case 'DEBUG':
        console.log('DEBUG: ', action, { state });
        break;
      default:
    }
  };
  
  const [lastAction, setLastAction] = useState();

  const [state, _dispatch] = useReducer(reducer, initialState);
  const dispatch = action => {
    setLastAction(action);
    _dispatch(action);
  }

  useEffect(() => {
    effector(lastAction, state);
  }, [lastAction, state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

const Container = styled.section`
  display: flex
`;

const Panel = styled.div`
  flex: 1;
`;

const ContentForm = () => {
  const { state, dispatch } = useContext(AppContext);

  return (
    <form>
      <label>
        <div>content:</div>
        <div>
          <textarea value={state.content} onChange={event => dispatch({ type: 'CHANGE_CONTENT', value: event.target.value })} />
        </div>
      </label>
    </form>
  );
}

function getFilteredContent(state) {
  const letters = state.letters.split('');
  const symbol = state.symbol;

  return useMemo(
    () => state.content
      .split('')
      .map(letter => letters.includes(letter) ? symbol : letter),
    [letters, symbol]
  );
}

const Preview = () => {
  const { state } = useContext(AppContext);
  const content = getFilteredContent(state);

  return (
    <div>
      {content}
    </div>
  );
}

const ConfigForm = () => {
  const { state, dispatch } = useContext(AppContext);

  return (
    <>
      <form>
        <label>
          <div>
            letters
          </div>
          <input value={state.letters} onChange={event => dispatch({ type: 'CHANGE_LETTERS', value: event.target.value })} />
        </label>
        <label>
          <div>
            symbol
          </div>
          <input value={state.symbol} onChange={event => dispatch({ type: 'CHANGE_SYMBOL', value: event.target.value })} />
        </label>
      </form>
      <button onClick={() => dispatch({ type: 'DEBUG', payload: 'testing, testing' })}>debug</button>
    </>
  );
}

class App extends Component {
  render() {
    return (
      <AppProvider>
        <Container>
          <Panel>
            <ContentForm />
            <ConfigForm />
          </Panel>
          <Panel>
            <Preview />
          </Panel>
        </Container>
      </AppProvider>
    );
  }
}

export default App;
