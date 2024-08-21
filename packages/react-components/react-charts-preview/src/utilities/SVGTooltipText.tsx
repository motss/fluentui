import * as React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Tooltip, usePortalMountNode } from '@fluentui/react-components';
import { Async, KeyCodes, getId } from '@fluentui/utilities';

interface ISVGTooltipTextProps {
  closeDelay?: number;
  content?: string;
  delay?: number;
  tooltipProps?: any;
  textProps?: React.SVGAttributes<SVGTextElement>;
  maxWidth?: number;
  maxHeight?: number;
  shouldReceiveFocus?: boolean;
  isTooltipVisibleProp?: boolean;
  wrapContent?: (content: string, id: string, maxWidth: number, maxHeight?: number) => boolean;
}

export const SVGTooltipText: React.FunctionComponent<ISVGTooltipTextProps> = React.forwardRef<
  HTMLDivElement,
  ISVGTooltipTextProps
>((props, forwardedRef) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const tooltipHostRef = useRef<SVGTextElement>(null);
  const async = useRef(new Async()).current;
  const dismissTimerId = useRef<number>();
  const openTimerId = useRef<number>();
  const tooltipHostId = useRef(getId('tooltip-host')).current;
  const ignoreNextFocusEvent = useRef(false);
  const portalMountNode = usePortalMountNode();

  const getTargetElement = useCallback((): HTMLElement | undefined => {
    return tooltipHostRef.current as unknown as HTMLElement;
  }, []);

  const wrapContentCallback = useCallback(() => {
    if (
      props.content &&
      props.wrapContent &&
      props.wrapContent(props.content, tooltipHostId, props.maxWidth, props.maxHeight)
    ) {
      setIsOverflowing(true);
    } else {
      setIsOverflowing(false);
    }
  }, [props.content, props.wrapContent, tooltipHostId, props.maxWidth, props.maxHeight]);

  useEffect(() => {
    wrapContentCallback();
    return () => {
      async.dispose();
    };
  }, [wrapContentCallback, async]);

  useEffect(() => {
    wrapContentCallback();
  }, [props.maxWidth, props.maxHeight, wrapContentCallback]);

  const hideTooltip = useCallback(() => {
    async.clearTimeout(openTimerId.current);
    async.clearTimeout(dismissTimerId.current);
    setIsTooltipVisible(false);
  }, [async]);

  const onTooltipMouseEnter = useCallback(
    (ev: React.MouseEvent<SVGElement>) => {
      if (!isOverflowing) {
        return;
      }

      if (ev.target && portalMountNode?.contains(ev.target as HTMLElement)) {
        return;
      }

      async.clearTimeout(dismissTimerId.current);
      async.clearTimeout(openTimerId.current);

      if (props.delay !== 0) {
        openTimerId.current = async.setTimeout(() => {
          setIsTooltipVisible(true);
        }, props.delay);
      } else {
        setIsTooltipVisible(true);
      }
    },
    [isOverflowing, portalMountNode, async, props.delay],
  );

  const onTooltipMouseLeave = useCallback(
    (ev: React.MouseEvent<SVGElement>) => {
      async.clearTimeout(dismissTimerId.current);
      async.clearTimeout(openTimerId.current);

      if (props.closeDelay) {
        dismissTimerId.current = async.setTimeout(() => {
          setIsTooltipVisible(false);
        }, props.closeDelay);
      } else {
        setIsTooltipVisible(false);
      }
    },
    [async, props.closeDelay],
  );

  const onTooltipFocus = useCallback(
    (ev: React.FocusEvent<SVGElement>) => {
      if (ignoreNextFocusEvent.current) {
        ignoreNextFocusEvent.current = false;
        return;
      }
      onTooltipMouseEnter(ev as unknown as React.MouseEvent<SVGElement>);
    },
    [onTooltipMouseEnter],
  );

  const onTooltipBlur = useCallback(
    (ev: React.FocusEvent<SVGElement>) => {
      ignoreNextFocusEvent.current = document?.activeElement === ev.target;
      dismissTimerId.current = async.setTimeout(() => {
        setIsTooltipVisible(false);
      }, 0);
    },
    [async],
  );

  const onTooltipKeyDown = useCallback(
    (ev: React.KeyboardEvent<SVGElement>) => {
      if ((ev.which === KeyCodes.escape || ev.ctrlKey) && isTooltipVisible) {
        hideTooltip();
        ev.stopPropagation();
      }
    },
    [isTooltipVisible, hideTooltip],
  );

  const showTooltip =
    (props.isTooltipVisibleProp && isOverflowing && !!props.content) || (isTooltipVisible && !!props.content);

  return (
    <>
      <Tooltip
        {...props.tooltipProps}
        withArrow
        content={props.content}
        targetElement={getTargetElement()}
        visible={showTooltip}
      >
        <text
          {...props.textProps}
          id={tooltipHostId}
          ref={tooltipHostRef}
          onFocusCapture={onTooltipFocus}
          onBlurCapture={onTooltipBlur}
          onMouseEnter={onTooltipMouseEnter}
          onMouseLeave={onTooltipMouseLeave}
          onKeyDown={onTooltipKeyDown}
          data-is-focusable={props.shouldReceiveFocus && isOverflowing}
        >
          {props.content}
        </text>
      </Tooltip>
    </>
  );
});

SVGTooltipText.defaultProps = {
  delay: 0,
};
